import {
  IOpenAIApi,
  ITranscription,
  ITranscriptionRequest,
} from "@/utils/openAI";
import { createReadStream } from "fs";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
const { Configuration, OpenAIApi } = require("openai");

export default async function Handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).send("Unauthorized");
  }

  // GET '/api/transcribe/'
  if (req.method === "GET") {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai: IOpenAIApi = new OpenAIApi(configuration);

    try {
      // Prepare the transcription request
      const transcriptionRequest: ITranscriptionRequest = {
        file: createReadStream("audio-3.mp3"),
        model: "whisper-1",
        language: "en",
      };

      // Transcribe
      const transcription: ITranscription = await openai.createTranscription(
        transcriptionRequest.file,
        transcriptionRequest.model
      );

      const transcriptionAndSummary = {
        transcription: transcription.data.text,
      };

      return res.status(200).send(transcriptionAndSummary);
    } catch (error) {
      console.log(error);
      res.status(500).send("Something went wrong.");
    }
  } else {
    res.status(405).send("Method not allowed.");
  }
}
