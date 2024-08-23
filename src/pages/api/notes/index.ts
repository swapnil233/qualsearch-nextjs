import { ErrorMessages } from "@/lib/constants/ErrorMessages";
import { HttpStatus } from "@/lib/constants/HttpStatus";
import prisma from "@/lib/prisma";
import { NoteWithTagsAndCreator } from "@/types";
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
      return handleGet(req, res);
    case "DELETE":
      return handleDelete(req, res);
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
    const {
      text,
      start,
      end,
      fileId,
      projectId,
      createdByUserId,
      tagIds,
    }: {
      text: string;
      start: number;
      end: number;
      fileId: string;
      projectId: string;
      createdByUserId: string;
      tagIds: string[];
    } = req.body;

    // Get the punctuated_word in between start and end
    let transcriptText = "";
    const transcript = await prisma.transcript.findUniqueOrThrow({
      where: {
        fileId: fileId,
      },
      select: {
        words: true,
      },
    });
    // @ts-ignore - Prisma stores this as a generic JSON value
    transcript.words.forEach((word) => {
      if (word.start >= start && word.end <= end) {
        transcriptText = transcriptText.concat(" ", word.punctuated_word);
      }
    });

    try {
      const newNote = await prisma.note.create({
        data: {
          text,
          transcriptText,
          start,
          end,
          fileId,
          projectId,
          createdByUserId,
          tags: {
            connect: tagIds.map((id) => ({ id: id })),
          },
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          tags: true,
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

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  console.log("GET");
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  // Extract teamId from the query parameters.
  const { noteId } = req.query;

  // Validate the presence of teamId.
  if (!noteId) {
    return res.status(HttpStatus.BadRequest).send(ErrorMessages.MissingTeamId);
  }

  try {
    const deletedNote: NoteWithTagsAndCreator = await prisma.note.delete({
      where: {
        id: noteId as string,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        tags: true,
        file: {
          select: {
            participantName: true,
            participantOrganization: true,
            dateConducted: true,
          },
        },
      },
    });

    res.status(200).json(deletedNote);
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ error: "Failed to delete note." });
  }
}
