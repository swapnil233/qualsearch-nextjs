import prisma from "@/lib/prisma";
import { TagWithNoteIds } from "@/types";

/**
 * Find an existing tag (case insensitive) within a project.
 *
 * @param tagName {string} Name of the tag to search.
 * @param projectId {string} The project ID where the tag is located.
 * @returns {Promise<TagWithNoteIds | null>} The existing tag or null if not found.
 */
export async function findExistingTag(tagName: string, projectId: string): Promise<TagWithNoteIds | null> {
    return await prisma.tag.findFirst({
        where: {
            projectId,
            name: {
                equals: tagName,
                mode: "insensitive", // Case-insensitive match
            },
        },
        include: {
            createdBy: { select: { id: true } },
            notes: { select: { id: true } },
        },
    });
}

/**
 * Create a new tag in the database.
 *
 * @param tagName {string} Name of the new tag.
 * @param projectId {string} The project ID where the tag will be created.
 * @param createdByUserId {string} The ID of the user who created the tag.
 * @returns {Promise<TagWithNoteIds>} The newly created tag.
 */
export async function createNewTag(tagName: string, projectId: string, createdByUserId: string): Promise<TagWithNoteIds> {
    return await prisma.tag.create({
        data: {
            name: tagName,
            projectId,
            createdByUserId,
        },
        include: {
            createdBy: { select: { id: true } },
            notes: { select: { id: true } },
        },
    });
}
