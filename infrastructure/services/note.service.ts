import { NoteWithTagsAndCreator } from "@/types";
import { formatDatesToIsoString } from "@/utils/formatDatesToIsoString";
import prisma from "@/utils/prisma";

export async function getNotesWithTagsAndCreator(
  projectId: string
): Promise<NoteWithTagsAndCreator[]> {
  let notes: NoteWithTagsAndCreator[] = await prisma.note.findMany({
    where: {
      projectId: projectId as string,
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

  return formatDatesToIsoString(notes);
}
