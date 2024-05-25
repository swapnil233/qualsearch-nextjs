import { ErrorMessages } from "@/constants/ErrorMessages";
import { HttpStatus } from "@/constants/HttpStatus";
import { makeChain } from "@/lib/ai/makeChain";
import pinecone from "@/lib/ai/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { AIMessage, HumanMessage } from "langchain/schema";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

/**
 * Handler for the '/api/chat' API endpoint.
 * This function is responsible for answering user questions using transcript embeddings.
 * 1. POST: Answer a user question.
 *
 * For all operations, the client must be authenticated.
 *
 * @param req {NextApiRequest} The HTTP request object.
 * @param res {NextApiResponse} The HTTP response object.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get the server session and authenticate the request.
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(HttpStatus.Unauthorized).send(ErrorMessages.Unauthorized);
  }

  // Handle the request depending on its HTTP method.
  switch (req.method) {
    case "POST":
      return handlePost(req, res);
    default:
      res.setHeader("Allow", ["POST"]);
      res
        .status(HttpStatus.MethodNotAllowed)
        .end(`Method ${req.method} Not Allowed`);
  }
}

// Type for the request body
interface IPostRequestBody {
  question: string;
  history: string[];
  fileId: string;
  transcriptId: string;
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { question, history, fileId, transcriptId } =
    req.body as IPostRequestBody;

  if (!question) {
    return res.status(400).json({ message: "No question in the request" });
  }

  try {
    const sanitizedQuestion = question.trim().replaceAll("\n", " ");
    const vectorStore = await initializeVectorStore(fileId, transcriptId);
    const chain = makeChain(vectorStore);
    const pastMessages = createPastMessages(history);

    const response = await chain.call({
      question: sanitizedQuestion,
      chat_history: pastMessages,
    });

    res.status(HttpStatus.Ok).json(response);
  } catch (error: any) {
    console.error("error", error);
    res
      .status(HttpStatus.InternalServerError)
      .json({ error: error.message || "Something went wrong" });
  }
}

async function initializeVectorStore(fileId: string, transcriptId: string) {
  const index = pinecone.Index(process.env.PINECONE_INDEX_NAME!);
  return await PineconeStore.fromExistingIndex(new OpenAIEmbeddings({}), {
    pineconeIndex: index,
    textKey: "text",
    namespace: `file-${fileId}-transcript-${transcriptId}`,
  });
}

function createPastMessages(history: string[]): (HumanMessage | AIMessage)[] {
  return history.map((message, i) =>
    i % 2 === 0 ? new HumanMessage(message) : new AIMessage(message)
  );
}
