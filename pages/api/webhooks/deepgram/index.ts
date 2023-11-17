import { ErrorMessages } from "@/constants/ErrorMessages";
import { HttpStatus } from "@/constants/HttpStatus";
import { sendEmail } from "@/lib/sendEmail";
import { host } from "@/utils/host";
import prisma from "@/utils/prisma";
import { getSizeInBytes } from "@/utils/setSizeInBytes";
import Cors from "micro-cors";
import { NextApiRequest, NextApiResponse } from "next";

const cors = Cors({
  allowMethods: ["POST", "HEAD"],
});

const webhookHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log(`Running in environment: ${process.env.NODE_ENV}`);
  console.log("webhookHandler started.");

  // Only allow POST
  if (req.method !== "POST")
    return res
      .status(HttpStatus.MethodNotAllowed)
      .send(ErrorMessages.MethodNotAllowed);

  const { request_id } = req.body.metadata;
  if (!request_id)
    return res
      .status(HttpStatus.BadRequest)
      .send("400 Bad request: request_id was not found in the request body.");

  const dgResponse = req.body.results.channels[0].alternatives[0];
  const metadata = req.body.metadata;

  console.log(`Request body size: ${getSizeInBytes(req.body)} bytes`);

  try {
    // Find the file that has this request ID
    const fileWithThisRequestId =
      await prisma.deepgramTranscriptRequest.findUnique({
        where: {
          request_id: request_id,
        },
        select: {
          file: true,
        },
      });

    console.log(`Searching for file with request_id: ${request_id}`);
    if (!fileWithThisRequestId?.file) {
      return res
        .status(HttpStatus.BadRequest)
        .send("No file associated with this Deepgram request_id");
    }

    const transcriptData = {
      confidence: dgResponse.confidence,
      words: dgResponse.words,
      topics: dgResponse.topics || {},
      entities: dgResponse.entities || {},
      summaries: dgResponse.summaries || {},
      paragraphs: dgResponse.paragraphs,
      transcriptString: dgResponse.transcript,
      metadata: {
        create: {
          created: metadata.created,
          tags: metadata.tags,
          models: metadata.models,
          sha256: metadata.sha256,
          channels: metadata.channels,
          duration: metadata.duration,
          model_info: metadata.model_info,
          request_id: request_id,
        },
      },
      file: {
        connect: {
          id: fileWithThisRequestId.file.id,
        },
      },
    };

    try {
      const [newTranscript, updatedFile] = await prisma.$transaction([
        prisma.transcript.create({
          data: transcriptData,
        }),

        prisma.file.update({
          where: {
            id: fileWithThisRequestId.file.id,
          },
          data: {
            status: "COMPLETED",
          },
        }),
      ]);

      console.log(
        `Transcript created with ID: ${newTranscript.id}. File status updated to ${updatedFile.status}.`
      );

      // Create embeddings for the new transcript
      console.log("Creating embeddings for the new transcript...");
      await fetch(`${host}/api/embeddings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcriptId: newTranscript.id,
        }),
      });
      console.log("Embeddings created.");

      const teamWithUsers = await prisma.team.findUnique({
        where: {
          id: fileWithThisRequestId.file.teamId,
        },
        select: {
          id: true,
          users: {
            select: {
              email: true,
            },
          },
        },
      });

      const userEmails = teamWithUsers?.users.map((user) => user.email);
      const linkToTranscribedFile = process.env.AMPLIFY_URL
        ? `${process.env.AMPLIFY_URL}/teams/${teamWithUsers?.id}/projects/${fileWithThisRequestId.file.projectId}/files/${fileWithThisRequestId.file.id}`
        : `https://${process.env.VERCEL_URL}/teams/${teamWithUsers?.id}/projects/${fileWithThisRequestId.file.projectId}/files/${fileWithThisRequestId.file.id}`;

      try {
        userEmails &&
          sendEmail(
            userEmails,
            "Transcription complete",
            `Your file has been transcribed! Visit the file at ${linkToTranscribedFile}`,
            `<h1>Transcription complete</h1><p>Your file has been transcribed! Visit the file at ${linkToTranscribedFile}</p>`
          );
      } catch (emailError: any) {
        console.log("Email sending error:", emailError.message);
      }

      console.log("webhookHandler completed.");

      return res.status(HttpStatus.Ok).send({
        fileWithThisRequestId: fileWithThisRequestId.file.id,
        newTranscriptId: newTranscript.id,
        updatedFileStatus: updatedFile.status,
      });
    } catch (transactionError) {
      console.error("Transaction failed:", transactionError);

      // Update the file status to ERROR
      await prisma.file.update({
        where: {
          id: fileWithThisRequestId.file.id,
        },
        data: {
          status: "ERROR",
        },
      });

      throw transactionError; // Propagate the error to the outer catch
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error);
      res.status(HttpStatus.InternalServerError).send(error.message);
    } else {
      console.error(error);
      res
        .status(HttpStatus.InternalServerError)
        .send(ErrorMessages.InternalServerError);
    }
  }
};

export default cors(webhookHandler as any);
