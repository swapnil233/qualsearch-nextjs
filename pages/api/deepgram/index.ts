import { NextApiRequest, NextApiResponse } from "next";
const { Deepgram } = require("@deepgram/sdk");

export default async function Handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    if (req.method !== "POST") {
        res.status(405).send("Method not allowed.");
    }

    try {
        const { DEEPGRAM_API_KEY } = process.env;

        if (!DEEPGRAM_API_KEY) {
            res.status(500).json({ message: "Deepgram API key not found" });
            return;
        }

        const deepgram = new Deepgram(DEEPGRAM_API_KEY);
        const { uri } = req.body;

        if (!uri) {
            res.status(400).json({ message: "No URI provided" });
            return;
        }

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
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An unexpected error occured" });
    }
}