import { ErrorMessages } from "@/constants/ErrorMessages";
import { HttpStatus } from "@/constants/HttpStatus";
import pinecone from "@/utils/pinecone";
import prisma from "@/utils/prisma";
import { Document } from "langchain/document";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
/**
 * Handler for the `${process.env.EXPRESS_BACKEND_URL}/api/embeddings/projects/` API endpoint.
 * This function is responsible for creating/upserting embeddings of a note to a Pinecone namespace which contains embeddings of all notes in a project.
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
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(HttpStatus.Unauthorized).send(ErrorMessages.Unauthorized);
  }

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
 * Handler for POST requests to `${process.env.EXPRESS_BACKEND_URL}/api/embeddings`.
 * This function creates/upserts embeddings for a given transcript.
 * The transcript ID should be provided in the request body.
 *
 * @param req {NextApiRequest} The HTTP request object.
 * @param res {NextApiResponse} The HTTP response object.
 */
export interface INoteEmbeddingRequestBody {
  projectId: string;
  noteId: string;
}

async function handleEmbedding(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Retrieve transcriptId from the request body.
    const { projectId, noteId } = req.body as INoteEmbeddingRequestBody;

    // Validate that transcriptId is provided.
    if (!projectId || !noteId) {
      return res.status(HttpStatus.BadRequest).send(ErrorMessages.BadRequest);
    }

    // Get the note from the database.
    let note = await prisma.note.findUnique({
      where: {
        id: noteId,
      },
      select: {
        text: true,
        transcriptText: true,
        createdAt: true,
        tags: {
          select: {
            name: true,
          },
        },
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
        file: {
          select: {
            name: true,
            description: true,
            participantName: true,
            participantOrganization: true,
            dateConducted: true,
          },
        },
        project: {
          select: {
            name: true,
            description: true,
          },
        },
        start: true,
        end: true,
      },
    });

    const docs = new Array(
      new Document({
        pageContent: JSON.stringify(note),
      })
    );

    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME!);

    // Upsert transcript embeddings to Pinecone vector store.
    const embeddings = await PineconeStore.fromDocuments(
      docs,
      new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
      }),
      {
        pineconeIndex,
        namespace: `project-${projectId}-notes`,
        textKey: "text",
      }
    );

    console.log("Embeddings", embeddings.embeddings);

    return res.status(HttpStatus.Ok).send(embeddings);
  } catch (error) {
    console.log(error);
    return res
      .status(HttpStatus.InternalServerError)
      .send(ErrorMessages.InternalServerError);
  }
}
