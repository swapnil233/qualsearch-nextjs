import TranscriptionCompletedEmail from "@/components/emails/TranscriptionCompletedEmail";
import { EmailAddresses } from "@/constants/EmailAddresses";
import { ErrorMessages } from "@/constants/ErrorMessages";
import { HttpStatus } from "@/constants/HttpStatus";
import { host } from "@/utils/host";
import prisma from "@/utils/prisma";
import { getSizeInBytes } from "@/utils/setSizeInBytes";
import Cors from "micro-cors";
import { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";

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

  console.log("Deepgram request ID present. Proceeding...");

  const dgResponse = req.body.results.channels[0].alternatives[0];
  const metadata = req.body.metadata;

  console.log(`Request body size: ${getSizeInBytes(req.body)} bytes`);

  try {
    // Find the file that has this request ID
    console.log(`Searching for file with request_id: ${request_id}`);

    const fileWithThisRequestId =
      await prisma.deepgramTranscriptRequest.findUnique({
        where: {
          request_id: request_id,
        },
        select: {
          file: true,
        },
      });

    if (!fileWithThisRequestId?.file) {
      return res
        .status(HttpStatus.BadRequest)
        .send("No file associated with this Deepgram request_id");
    }

    console.log(`File with ID "${fileWithThisRequestId.file.id}" found.`);

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
      await fetch(
        `${process.env.NEXT_PUBLIC_EXPRESS_BACKEND_URL}/api/embeddings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            transcriptId: newTranscript.id,
          }),
        }
      );
      console.log("Embeddings created.");

      // Get the team and users associated with this file
      const teamWithUsers = await prisma.team.findUnique({
        where: {
          id: fileWithThisRequestId.file.teamId,
        },
        select: {
          id: true,
          users: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      // Create the link to the transcribed file
      const linkToTranscribedFile = `${host}/teams/${teamWithUsers?.id}/projects/${fileWithThisRequestId.file.projectId}/files/${fileWithThisRequestId.file.id}`;

      try {
        console.log("Sending email(s)...");
        if (teamWithUsers) {
          // Send the invitation email(s).
          const resend = new Resend(process.env.RESEND_API_KEY);
          const emailPromises = teamWithUsers.users.map(async (user) => {
            await resend.emails.send({
              from: EmailAddresses.Noreply,
              to: [user.email as string],
              subject: `Transcription completed for ${fileWithThisRequestId.file.name}`,
              react: TranscriptionCompletedEmail({
                userName: user.name as string,
                fileName: fileWithThisRequestId.file.name,
                linkToTranscribedFile: linkToTranscribedFile,
              }),
            });

            console.log(`Email sent to ${user.email}`);
          });

          // Await all email sending promises and handle failures.
          await Promise.allSettled(emailPromises);
        }
      } catch (error) {
        console.error("Failed to send email:", error);
      }

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
