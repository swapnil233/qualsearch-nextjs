import { ErrorMessages } from "@/constants/ErrorMessages";
import { HttpStatus } from "@/constants/HttpStatus";
import { getTranscriptById } from "@/infrastructure/services/transcript.service";
import { CleanedParagraph, TranscriptParagraphs } from "@/types";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

/**
 * Handler for the '/api/clean-transcripts' API endpoint.
 * This function is responsible for taking the transcript JSON from the DB and cleaning it up.
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
    case "GET":
      return handleTranscriptCleanup(req, res);
    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

/**
 * Handler for POST requests to `${process.env.NEXT_PUBLIC_EXPRESS_BACKEND_URL}/api/embeddings`.
 * This function takes the transcript.paragraph JSON from the DB given a transcript ID,
 * and returns essentially transcript.paragraphs.transcript but as a JSON object instead of a string.
 *
 * @param req {NextApiRequest} The HTTP request object.
 * @param res {NextApiResponse} The HTTP response object.
 */
async function handleTranscriptCleanup(
  req: NextApiRequest,
  res: NextApiResponse<CleanedParagraph[] | { message: string }>
): Promise<void> {
  try {
    const { transcriptId } = req.query;

    if (!transcriptId) {
      return res
        .status(HttpStatus.BadRequest)
        .json({ message: ErrorMessages.BadRequest });
    }

    const transcript = await getTranscriptById(transcriptId as string);

    if (!transcript) {
      return res
        .status(HttpStatus.NotFound)
        .json({ message: ErrorMessages.NotFound });
    }

    const cleanedTranscript = cleanTranscript(
      transcript.paragraphs as TranscriptParagraphs
    );
    return res.status(HttpStatus.Ok).json(cleanedTranscript);
  } catch (error) {
    console.error(error);
    return res
      .status(HttpStatus.InternalServerError)
      .json({ message: ErrorMessages.InternalServerError });
  }
}

// Helper function to clean the transcript
function cleanTranscript(paragraphs: TranscriptParagraphs): CleanedParagraph[] {
  const cleanedParagraphs: CleanedParagraph[] = paragraphs.paragraphs.map(
    (paragraph) => ({
      speaker: paragraph.speaker,
      sentences: paragraph.sentences.map((sentence) => sentence.text).join(" "),
    })
  );

  return mergeParagraphsBySpeaker(cleanedParagraphs);
}

// Helper function to merge paragraphs with the same speaker
function mergeParagraphsBySpeaker(
  paragraphs: CleanedParagraph[]
): CleanedParagraph[] {
  return paragraphs.reduce<CleanedParagraph[]>((acc, curr) => {
    const lastParagraph = acc[acc.length - 1];

    if (lastParagraph && lastParagraph.speaker === curr.speaker) {
      lastParagraph.sentences += " " + curr.sentences;
      return acc;
    }
    return [...acc, curr];
  }, []);
}
