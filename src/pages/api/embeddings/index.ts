import { getTranscriptById } from "@/infrastructure/services/transcript.service";
import pinecone from "@/lib/ai/pinecone";
import { ErrorMessages } from "@/lib/constants/ErrorMessages";
import { HttpStatus } from "@/lib/constants/HttpStatus";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { NextApiRequest, NextApiResponse } from "next";
/**
 * Handler for the `${process.env.NEXT_PUBLIC_EXPRESS_BACKEND_URL}/api/embeddings` API endpoint.
 * This function is responsible for creating/upserting embeddings for a given transcript.
 *
 * For this operation, the client must be authenticated.
 *
 * @param req {NextApiRequest} The HTTP request object.
 * @param res {NextApiResponse} The HTTP response object.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get the server session and authenticate the request.
  // const session = await getServerSession(req, res, authOptions);

  // if (!session) {
  //   return res.status(HttpStatus.Unauthorized).send(ErrorMessages.Unauthorized);
  // }

  // Handle the request depending on its HTTP method.
  switch (req.method) {
    case "POST":
      return handleEmbedding(req, res);
    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

/**
 * Handler for POST requests to `${process.env.NEXT_PUBLIC_EXPRESS_BACKEND_URL}/api/embeddings`.
 * This function creates/upserts embeddings for a given transcript.
 * The transcript ID should be provided in the request body.
 *
 * @param req {NextApiRequest} The HTTP request object.
 * @param res {NextApiResponse} The HTTP response object.
 */
async function handleEmbedding(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Retrieve transcriptId from the request body.
    const { transcriptId } = req.body;

    // Validate that transcriptId is provided.
    if (!transcriptId) {
      return res.status(HttpStatus.BadRequest).send(ErrorMessages.BadRequest);
    }

    // Get the transcript from DB
    const transcript = await getTranscriptById(transcriptId as string);

    if (!transcript) {
      return res.status(HttpStatus.NotFound).send(ErrorMessages.NotFound);
    }

    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME!);

    // Split transcript into 10,000 char chunks with 500 char overlap
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 10000,
      chunkOverlap: 500,
    });

    const splitTranscript = await splitter.createDocuments([
      // @ts-ignore
      JSON.stringify(transcript.paragraphs.transcript),
    ]);

    // Upsert transcript embeddings to Pinecone vector store.
    await PineconeStore.fromDocuments(
      splitTranscript,
      new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
      }),
      {
        pineconeIndex,
        namespace: `file-${transcript.fileId}-transcript-${transcript.id}`,
        textKey: "text",
      }
    );

    return res.status(HttpStatus.Ok).send({ message: "Embedding successful." });
  } catch (error) {
    console.log(error);
    return res
      .status(HttpStatus.InternalServerError)
      .send(ErrorMessages.InternalServerError);
  }
}
