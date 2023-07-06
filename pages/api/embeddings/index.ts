import { IEmbeddings, IEmbeddingsRequest, IOpenAIApi } from "@/utils/openAI";
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

  // POST '/api/embeddings/'
  if (req.method === "POST") {
    const { text } = req.body;
    if (!text) {
      return res.status(400).send("No text provided to create embeddings for.");
    }

    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai: IOpenAIApi = new OpenAIApi(configuration);

    try {
      // Prepare the embedding request
      const embeddingRequest: IEmbeddingsRequest = {
        model: "text-embedding-ada-002",
        input: text,
      };

      // Generate embeddings
      const embeddings: IEmbeddings = await openai.createEmbedding(
        embeddingRequest
      );

      return res.status(200).send(embeddings.data.data[0].embedding);
    } catch (error: any) {
      // console.log(error);
      if (error.response) {
        console.log(error.response.status);
        console.log(error.response.data);
        res.status(500).send(error.response.data);
      } else {
        res.status(500).send(error.message);
      }
    }
  } else {
    res.status(405).send("Method not allowed.");
  }
}
