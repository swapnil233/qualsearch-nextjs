import prisma from "@/utils/prisma";
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

/**
 * Handler for the '/api/file/create' API endpoint.
 * This function is responsible for creating a new file in the user's project.
 *
 * Here is a high-level overview of its flow:
 * 1. It verifies that the client is authenticated.
 * 2. It verifies that the request is a POST request and contains all required parameters.
 * 3. It makes a request to the '/api/aws/getSignedUrl' endpoint to get the signed URL for the file.
 * 4. It sends a POST request to the '/api/deepgram/' endpoint with the signed URL to get the transcription of the multimedia file.
 * 5. It creates a new file record in the database.
 *
 * @param req The HTTP request object.
 * @param res The HTTP response object.
 */

export default async function Handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // Retrieve the session from the request, to check if the user is authenticated.
    const session = await getServerSession(req, res, authOptions);

    // If the session is not found, respond with a 401 status code (Unauthorized).
    if (!session) {
        return res.status(401).send("Unauthorized");
    }

    if (req.method === "POST") {
        // Destructure the needed properties from the request body.
        const { fileName, fileDescription, projectId, key, mimeType } = req.body;

        // Check if the fileName and fileDescription are not undefined or empty.
        if (!fileName || !fileDescription) {
            return res.status(400).send("Missing team name or description.");
        }

        // Check if a projectId is provided
        if (!projectId || projectId.length === 0) {
            return res.status(400).send("Project ID is missing from the request body");
        }

        const baseUrl = process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3003'
        console.log(baseUrl);

        // Make a GET request to '/api/aws/getSignedUrl?key={key}' to get the signed URL for the file.
        const response = await axios.get(`${baseUrl}/api/aws/getSignedUrl?key=${key}`);
        const signedUrl = response.data.url;

        // Make a POST request to '/api/deepgram/' to get the transcription of the audio file.
        const deepgramResponse = await axios.post(`${baseUrl}/api/deepgram/`, {
            uri: signedUrl,
        });
        const transcription = deepgramResponse.data;

        try {
            // Create a new file in the database with the information from the request.
            const file = await prisma.file.create({
                data: {
                    name: fileName,
                    description: fileDescription,
                    projectId: projectId,
                    uri: key,
                    transcript: transcription,
                    mimeType: mimeType,
                },
            })

            // If the creation was successful, respond with a 200 status code and the created file.
            return res.status(200).send(file);
        } catch (error) {
            // If an error occurred, respond with a 500 status code (Internal Server Error).
            console.log(error);
            res.status(500).send("Something went wrong.");
        }
    }
}
