import {
  createNewTag,
  findExistingTag,
} from "@/infrastructure/services/tag.service";
import { ErrorMessages } from "@/lib/constants/ErrorMessages";
import { HttpStatus } from "@/lib/constants/HttpStatus";
import prisma from "@/lib/prisma";
import { TagWithNoteIds } from "@/types";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

/**
 * API handler for '/api/tags' endpoint.
 * Supports creating tags (POST), fetching project tags (GET), and deleting tags (DELETE).
 *
 * @param req {NextApiRequest} The HTTP request object.
 * @param res {NextApiResponse} The HTTP response object.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res
      .status(HttpStatus.Unauthorized)
      .json({ error: ErrorMessages.Unauthorized });
  }

  switch (req.method) {
    case "POST":
      return handleCreateTags(req, res);
    case "GET":
      return handleFetchTags(req, res);
    case "DELETE":
      return handleDeleteTag(req, res);
    default:
      res.setHeader("Allow", ["POST", "GET", "DELETE"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function handleCreateTags(req: NextApiRequest, res: NextApiResponse) {
  const {
    newTagNames,
    projectId,
    createdByUserId,
  }: { newTagNames: string[]; projectId: string; createdByUserId: string } =
    req.body;

  try {
    const createdTags: TagWithNoteIds[] = [];
    const existingTagIds = new Set<string>();

    // Iterate over the new tag names and either find or create them
    for (const tagName of newTagNames) {
      const existingTag = await findExistingTag(tagName, projectId);

      if (existingTag && !existingTagIds.has(existingTag.id)) {
        // Add the existing tag to the response if not already added
        createdTags.push(existingTag);
        existingTagIds.add(existingTag.id);
      } else if (!existingTag) {
        // If the tag does not exist, create a new one
        const newTag = await createNewTag(tagName, projectId, createdByUserId);
        createdTags.push(newTag);
      }
    }

    return res.status(HttpStatus.Ok).json(createdTags);
  } catch (error) {
    console.error("Error creating tags:", error);
    return res
      .status(HttpStatus.InternalServerError)
      .json({ error: "Failed to create tags." });
  }
}

async function handleFetchTags(req: NextApiRequest, res: NextApiResponse) {
  const { projectId } = req.query;

  if (!projectId) {
    return res
      .status(HttpStatus.BadRequest)
      .json({ error: "Missing project ID." });
  }

  try {
    const tags = await prisma.tag.findMany({
      where: {
        projectId: projectId as string,
      },
    });
    return res.status(HttpStatus.Ok).json(tags);
  } catch (error) {
    console.error("Error fetching tags:", error);
    return res
      .status(HttpStatus.InternalServerError)
      .json({ error: "Failed to fetch tags." });
  }
}

async function handleDeleteTag(req: NextApiRequest, res: NextApiResponse) {
  // Placeholder for delete logic
  console.log("DELETE handler called");
  return res.status(HttpStatus.Ok).json({ message: "DELETE handler called" });
}
