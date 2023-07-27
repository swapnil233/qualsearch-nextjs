import { ErrorMessages } from "@/constants/ErrorMessages";
import { HttpStatus } from "@/constants/HttpStatus";
import prisma from "@/utils/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    switch (req.method) {
        case "POST":
            return handlePost(req, res);
        case "GET":
            return handleGet(req, res);
        case "DELETE":
            return handleDelete(req, res);
        default:
            res.setHeader("Allow", ["POST", "GET", "DELETE"]);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
    console.log("POST");
}

async function handleGet(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    try {
        // Get Pinecone client instance by awaiting the promise
        // const pinecone = await pineconePromise;

        // const newIndex = await pinecone.createIndex({
        //     createRequest: {
        //         name: "example-index",
        //         dimension: 1536,
        //         podType: "p1",
        //     },
        // });

        const transcriptId = 'clkjthj2c000emr0fn5i487yv';
        const transcript = await prisma.transcript.findUnique({
            where: {
                id: transcriptId
            },
            select: {
                transcriptString: true
            }
        })

        /* Split text into chunks */
        // const textSplitter = new RecursiveCharacterTextSplitter({
        //     chunkSize: 1000,
        //     chunkOverlap: 200,
        // });

        // const docs = await textSplitter.splitDocuments(transcript?.transcriptString);
        // console.log('split docs', docs);

        return res.status(HttpStatus.Ok).send(transcript);
    } catch (error) {
        // Log the error for debugging purposes.
        console.log(error);

        // If an error occurred, respond with a 500 status code (Internal Server Error).
        return res
            .status(HttpStatus.InternalServerError)
            .send(ErrorMessages.InternalServerError);
    }
}

async function handleDelete(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    console.log("DELETE");
}