import { NextApiRequest, NextApiResponse } from "next";
const { Deepgram } = require("@deepgram/sdk");

export default async function Handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "POST") {
        const { DEEPGRAM_API_KEY } = process.env;
        const deepgram = new Deepgram(DEEPGRAM_API_KEY);
        const { uri } = req.body;

        const audioSource = {
            url: uri as string,
        }

        const options = {
            model: "nova",
            language: "en",
            smart_format: true,
            redact: ['pci', 'ssn'],
            diarize: true,
        }

        const response = await deepgram.transcription.preRecorded(audioSource, options);

        res.status(200).json(response);
    } else {
        res.status(405).json({ message: "Method not allowed" });
    }
}