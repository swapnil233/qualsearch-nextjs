import { ErrorMessages } from "@/constants/ErrorMessages";
import { HttpStatus } from "@/constants/HttpStatus";
import prisma from "@/utils/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

/**
 * Handler for the '/api/notes' API endpoint.
 * This function is responsible for performing various notes-related operations,
 * depending on the HTTP method of the request:
 * 1. POST: Create a new note.
 * 2. GET: Fetch notes.
 * 3. DELETE: Delete a note.
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
    case "GET":
      return handleGet(req, res, session);
    case "DELETE":
      return handleDelete(req, res, session);
    default:
      res.setHeader("Allow", ["POST", "GET", "DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

/**
 * Handler for POST requests to '/api/notes'.
 * This function creates a new note.
 *
 * @param req {NextApiRequest} The HTTP request object.
 * @param res {NextApiResponse} The HTTP response object.
 */
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { text, start, end, fileId, projectId, createdByUserId, tags }: {
      text: string,
      start: number,
      end: number,
      fileId: string,
      projectId: string,
      createdByUserId: string,
      tags: string[],
    } =
      req.body;

    try {
      const newNote = await prisma.note.create({
        data: {
          text,
          start,
          end,
          fileId,
          projectId,
          createdByUserId,
          tags: {
            connect: tags.map(tagId => ({ id: tagId }))
          }
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          tags: true
        },
      });

      console.log("Created note:", newNote);
      res.status(201).json(newNote); // Return the created note
    } catch (error) {
      console.error("Error creating note:", error);
      res.status(500).json({ error: "Failed to create note." });
    }
  } else {
    res.status(405).json({ error: "Method not allowed." });
  }
}

async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse,
  session: any
) {
  console.log("GET");
}

async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse,
  session: any
) {
  console.log("DELETE");
}