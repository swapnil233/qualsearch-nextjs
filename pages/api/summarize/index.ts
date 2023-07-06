import { IChatCompletion, IOpenAIApi } from "@/utils/openAI";
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

  // POST '/api/summarize/'
  if (req.method === "POST") {
    const { transcription } = req.body;
    if (!transcription) {
      return res.status(400).send("No transcription provided.");
    }

    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai: IOpenAIApi = new OpenAIApi(configuration);

    try {
      // Summarize
      const summary: IChatCompletion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "Summarize the given text. Create bullet points where appropriate.",
          },
          {
            role: "user",
            content: transcription,
          },
        ],
        temperature: 0.3,
      });

      const transcriptionAndSummary = {
        summary: summary.data.choices[0].message.content,
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
