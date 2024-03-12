import { ErrorMessages } from "@/constants/ErrorMessages";
import { HttpStatus } from "@/constants/HttpStatus";
import pinecone from "@/utils/pinecone";
import { VectorDBQAChain } from "langchain/chains";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * Handler for the '/api/answer-question' API endpoint.
 * This function is responsible for answering user questions using transcript embeddings.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Authenticate the request.
  // const session = await getServerSession(req, res, authOptions);
  // if (!session) {
  //     return res.status(HttpStatus.Unauthorized).send(ErrorMessages.Unauthorized);
  // }

  // Handle POST request.
  if (req.method === "POST") {
    return handleQuestion(req, res);
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

/**
 * Handler for POST requests to '/api/answer-question'.
 * This function uses LangChain and Pinecone to answer user questions.
 *
 * @param req {NextApiRequest} The HTTP request object.
 * @param res {NextApiResponse} The HTTP response object.
 */
async function handleQuestion(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Retrieve question from the request body.
    const { question, fileId, transcriptId } = req.body;

    if (!question) {
      return res.status(HttpStatus.BadRequest).send(ErrorMessages.BadRequest);
    }

    // Initialize Pinecone and LangChain.
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME!);

    // First, check for embeddings in Pinecone using the namespace 'file-{fileId}-transcript-{transcriptId}'.
    const stats = await pineconeIndex.describeIndexStats();

    if (
      !stats.namespaces ||
      stats.namespaces[`file-${fileId}-transcript-${transcriptId}`] ===
        undefined
    ) {
      console.log(
        "Embeddings for the transcript not found in Pinecone. Creating embeddings..."
      );
      try {
        console.log("Creating embeddings for the transcript...");
        // Create embeddings for the transcript.
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_EXPRESS_BACKEND_URL}/api/embeddings`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ transcriptId }),
          }
        );

        if (!response.ok) {
          console.error("Error creating embeddings for the transcript");
          return res
            .status(HttpStatus.InternalServerError)
            .send(ErrorMessages.InternalServerError);
        }

        console.log(response.json());
      } catch (error) {
        console.error(error);
        return res
          .status(HttpStatus.InternalServerError)
          .send(ErrorMessages.InternalServerError);
      }
    }

    console.log(
      "Embeddings for the transcript found in Pinecone. Retrieving embeddings..."
    );
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings(),
      {
        pineconeIndex,
        namespace: `file-${fileId}-transcript-${transcriptId}`,
      }
    );

    const model = new OpenAI({
      modelName: "gpt-4-1106-preview",
      temperature: 0.3,
    });

    // Create a LangChain QA chain.
    const chain = VectorDBQAChain.fromLLM(model, vectorStore, {
      k: 2,
    });

    // Answer the question.
    const response = await chain.call({ query: question });

    return res.status(HttpStatus.Ok).send({ response });
  } catch (error) {
    console.error(error);
    return res
      .status(HttpStatus.InternalServerError)
      .send(ErrorMessages.InternalServerError);
  }
}
