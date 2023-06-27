import prisma from "@/utils/prisma";
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

// POST '/api/file/create'
export default async function Handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
        return res.status(401).send("Unauthorized");
    }

    if (req.method === "POST") {
        const { fileName, fileDescription, projectId, key } = req.body;
        if (!fileName || !fileDescription) {
            return res.status(400).send("Missing team name or description.");
        }

        const baseUrl = process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3003'
        console.log(baseUrl);

        // GET /api/aws/getSignedUrl?key={key} endpoint to get the signed URL for the file
        const response = await axios.get(`${baseUrl}/api/aws/getSignedUrl?key=${key}`);
        const signedUrl = response.data.url;
        console.log(signedUrl);

        // POST /api/deepgram/ to get the transcription
        const deepgramResponse = await axios.post(`${baseUrl}/api/deepgram/`, {
            uri: signedUrl,
        });
        const transcription = deepgramResponse.data;
        console.log(transcription);

        try {
            const file = await prisma.file.create({
                data: {
                    name: fileName,
                    description: fileDescription,
                    projectId: projectId,
                    uri: key,
                    transcript: transcription,
                },
            })

            return res.status(200).send(file);
        } catch (error) {
            console.log(error);
            res.status(500).send("Something went wrong.");
        }
    }
}