import { ErrorMessages } from "@/constants/ErrorMessages";
import { HttpStatus } from "@/constants/HttpStatus";
import prisma from "@/utils/prisma";
import Cors from "micro-cors";
import { NextApiRequest, NextApiResponse } from "next";

const cors = Cors({
  allowMethods: ["POST", "HEAD"],
});

const webhookHandler = async (req: NextApiRequest, res: NextApiResponse) => {

  /**
     req.body = {
      metadata: {
        transaction_key: 'deprecated',
        request_id: '562827bd-de8e-4fb6-8678-fa3a7e55de24',
        sha256: '380ece2b282ca047850648243a6eb0a713de9678ec42a656b49e017e15b33359',
        created: '2023-07-11T04:00:59.109Z',
        duration: 578.904,
        channels: 1,
        models: [ '85b5dbfd-bc1d-46b5-99d8-070d379a7f97' ],
        model_info: { '85b5dbfd-bc1d-46b5-99d8-070d379a7f97': [Object] },
        tags: [ 'cljxqx7bg0007r9sw9k6qs61o-cljxqxi850009r9sw5rqb65hp' ]
      },
      
      results: { channels: [ [Object] ] }
    }
   */

  // Only allow POST
  if (req.method !== "POST") return res.status(HttpStatus.MethodNotAllowed).send(ErrorMessages.MethodNotAllowed);

  const { request_id } = req.body.metadata;
  if (!request_id) return res.status(HttpStatus.BadRequest).send(ErrorMessages.BadRequest);

  const dgResponse = req.body.results.channels[0].alternatives[0];
  const metadata = req.body.metadata;

  try {

    // Find the file that has this request ID
    const fileWithThisRequestId = await prisma.deepgramTranscriptRequest.findUnique({
      where: {
        request_id: request_id
      },
      select: {
        file: true
      }
    })

    if (!fileWithThisRequestId?.file) {
      return res
        .status(HttpStatus.BadRequest)
        .send("No file associated with this request ID")
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
            request_id: request_id
          }
        },
        file: {
          connect: {
            id: fileWithThisRequestId.file.id
          }
        }
      }
    })

    // Update the file's status to COMPLETED
    const updatedFile = await prisma.file.update({
      where: {
        id: fileWithThisRequestId.file.id
      },
      data: {
        status: "COMPLETED"
      }
    })

    return res.status(HttpStatus.Ok).send({
      fileWithThisRequestId: fileWithThisRequestId.file.id,
      newTranscriptId: newTranscript.id,
      updatedFileStatus: updatedFile.status
    })

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(error)
      res.status(HttpStatus.InternalServerError).send(error.message);
    } else {
      console.log(error)
      res
        .status(HttpStatus.InternalServerError)
        .send(ErrorMessages.InternalServerError);
    }
  }
};

export default cors(webhookHandler as any);
