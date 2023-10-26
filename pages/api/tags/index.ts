import { ErrorMessages } from "@/constants/ErrorMessages";
import { HttpStatus } from "@/constants/HttpStatus";
import { TagWithNoteIds } from "@/types";
import prisma from "@/utils/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

/**
 * Handler for the '/api/tags' API endpoint.
 * This function is responsible for performing various tags-related operations,
 * depending on the HTTP method of the request:
 * 1. POST: Create a new tag or tags.
 * 2. GET: Fetch all tags of a project.
 * 3. DELETE: Delete a tag.
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
            return handleDelete(req, res, session);
        default:
            res.setHeader("Allow", ["POST", "GET", "DELETE"]);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

/**
 * Handler for POST requests to '/api/tags'.
 * This function creates new tag(s) given an array of tags
 *
 * @param req {NextApiRequest} The HTTP request object.
 * @param res {NextApiResponse} The HTTP response object.
 */
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
    interface IPostBody {
        newTagNames: string[];
        createdByUserId: string;
        projectId: string;
    }

    const { newTagNames, projectId, createdByUserId, }: IPostBody = req.body;

    try {
        let newTags: TagWithNoteIds[] = []

        const checkIfTagExistsOrCreateTag = async (tagName: string) => {
            // Check if there's a tag with that name in the project scope.
            const tagCount = await prisma.tag.count({
                where: {
                    projectId: projectId,
                    name: {
                        contains: tagName,
                        mode: "insensitive"
                    }
                }
            })

            // If the tag doesn't exist, create it.
            if (tagCount === 0) {
                const newTag = await prisma.tag.create({
                    data: {
                        name: tagName,
                        projectId: projectId,
                        createdByUserId: createdByUserId
                    },
                    include: {
                        createdBy: {
                            select: {
                                id: true,
                            }
                        },
                        notes: {
                            select: {
                                id: true,
                            }
                        }
                    }
                })

                newTags.push(newTag)
            } else {
                console.log(`Tag ${tagName} already exists.`)
                res.status(409).send(`Tag ${tagName} already exists.`)
            }
        }

        await Promise.all(newTagNames.map(tagName => checkIfTagExistsOrCreateTag(tagName)))

        res.status(HttpStatus.Ok).send(newTags)
    } catch (error) {
        console.error("Error creating note:", error);
        res.status(500).json({ error: "Failed to create tags." });
    }
}

async function handleGet(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const { projectId } = req.query;

    try {
        const tags = await prisma.tag.findMany({
            where: {
                projectId: projectId as string,
            },
        });

        console.log(tags)
        res.status(HttpStatus.Ok).send(tags)
    } catch (error) {
        console.error("Error fetching tags:", error);
        res.status(500).json({ error: "Failed to fetch tags." });
    }
}

async function handleDelete(
    req: NextApiRequest,
    res: NextApiResponse,
    session: any
) {
    console.log("DELETE");
}
