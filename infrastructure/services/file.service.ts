import { FileWithoutTranscriptAndUri } from "@/types";
import { formatDatesToIsoString } from "@/utils/formatDatesToIsoString";
import prisma from "@/utils/prisma";

export async function getFilesWithoutTranscriptAndUriGivenProjectId(
  projectId: string
): Promise<FileWithoutTranscriptAndUri[]> {
  let file = await prisma.file.findMany({
    where: {
      projectId: projectId as string,
    },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      updatedAt: true,
      type: true,
      projectId: true,
      teamId: true,
      status: true,
      participantName: true,
      participantOrganization: true,
      dateConducted: true,
      transcriptRequestId: {
        select: {
          request_id: true,
        },
      },
    },
  });

  return formatDatesToIsoString(file);
}
