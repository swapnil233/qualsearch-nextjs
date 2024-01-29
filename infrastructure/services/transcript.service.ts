import prisma from "@/utils/prisma";
import { Transcript } from "@prisma/client";

/**
 * Gets a transcript given an ID
 * @param id id of transcript
 * @returns a Transcript or null
 */
export const getTranscriptById = async (
  id: string
): Promise<Transcript | null> => {
  try {
    const transcript = await prisma.transcript.findUnique({
      where: {
        id: id,
      },
    });

    return transcript;
  } catch (error: any) {
    throw new Error(error);
  }
};
