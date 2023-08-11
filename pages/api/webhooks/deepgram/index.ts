import { ErrorMessages } from "@/constants/ErrorMessages";
import { HttpStatus } from "@/constants/HttpStatus";
import prisma from "@/utils/prisma";
import Cors from "micro-cors";
import { NextApiRequest, NextApiResponse } from "next";
import nodemailer from 'nodemailer';

const sendEmail = async (recipients: (string | null)[], subject: string, text: string, htmlTemplate?: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  })

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipients.join(","),
    subject: subject,
    text: text,
    htmlTemplate: htmlTemplate
  }

  await transporter.sendMail(mailOptions)
}

const cors = Cors({
  allowMethods: ["POST", "HEAD"],
});

const webhookHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Only allow POST
  if (req.method !== "POST")
    return res
      .status(HttpStatus.MethodNotAllowed)
      .send(ErrorMessages.MethodNotAllowed);

  const { request_id } = req.body.metadata;
  if (!request_id)
    return res.status(HttpStatus.BadRequest).send(ErrorMessages.BadRequest);

  const dgResponse = req.body.results.channels[0].alternatives[0];
  const metadata = req.body.metadata;

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

    if (!fileWithThisRequestId?.file) {
      return res
        .status(HttpStatus.BadRequest)
        .send("No file associated with this request ID");
    }

    // Create a new Transcript row with the data
    const newTranscript = await prisma.transcript.create({
      data: {
        confidence: dgResponse.confidence,
        words: dgResponse.words,
        topics: dgResponse.topics,
        entities: dgResponse.entities,
        summaries: dgResponse.summaries,
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
      },
    });

    // Update the file's status to COMPLETED
    const updatedFile = await prisma.file.update({
      where: {
        id: fileWithThisRequestId.file.id,
      },
      data: {
        status: "COMPLETED",
      },
    });

    const teamWithUsers = await prisma.team.findUnique({
      where: {
        id: fileWithThisRequestId.file.teamId
      },
      select: {
        id: true,
        users: {
          select: {
            email: true
          }
        }
      }
    })

    const userEmails = teamWithUsers?.users.map(user => user.email);
    const linkToTranscribedFile = process.env.AMPLIFY_URL
      ? `${process.env.AMPLIFY_URL}/teams/${teamWithUsers?.id}/projects/${fileWithThisRequestId.file.projectId}/files/${fileWithThisRequestId.file.id}`
      : `https://${process.env.VERCEL_URL}/teams/${teamWithUsers?.id}/projects/${fileWithThisRequestId.file.projectId}/files/${fileWithThisRequestId.file.id}`

    // send email
    try {
      userEmails && sendEmail(
        userEmails,
        "Transcription complete",
        `Your file has been transcribed! Visit the file at ${linkToTranscribedFile}`,
        `<h1>Transcription complete</h1><p>Your file has been transcribed! Visit the file at ${linkToTranscribedFile}</p>`)
    } catch (error: any) {
      console.log(error.message)
    }

    return res.status(HttpStatus.Ok).send({
      fileWithThisRequestId: fileWithThisRequestId.file.id,
      newTranscriptId: newTranscript.id,
      updatedFileStatus: updatedFile.status,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(error);
      res.status(HttpStatus.InternalServerError).send(error.message);
    } else {
      console.log(error);
      res
        .status(HttpStatus.InternalServerError)
        .send(ErrorMessages.InternalServerError);
    }
  }
};

export default cors(webhookHandler as any);
