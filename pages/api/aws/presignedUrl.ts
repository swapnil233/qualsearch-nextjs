import { GetObjectCommand, HeadObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextApiRequest, NextApiResponse } from "next";
const logger = require("@/utils/logger"); // Import the logger middleware using the 'require' syntax

const createPresignedUrlWithClient = async ({
    region,
    bucket,
    key,
}: {
    region: string;
    bucket: string;
    key: string;
}) => {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID!;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY!;

    const client = new S3Client({
        region,
        credentials: {
            accessKeyId,
            secretAccessKey,
        },
    });

    // Check if the file exists
    const headCommand = new HeadObjectCommand({ Bucket: bucket, Key: key });
    try {
        await client.send(headCommand);
    } catch (error: any) {
        if (error.name === 'NoSuchKey') {
            throw new Error('File does not exist');
        }
        throw error;
    }

    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    return getSignedUrl(client, command, { expiresIn: 4 * 60 * 60 }); // 4 hours
};

export default async function Handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    await logger(req, res, async () => {
        // If the request method is HEAD, only send the status
        if (req.method === "HEAD") {
            res.status(200).end();
            return;
        }

        if (req.method !== "GET") {
            res.status(405).send("Method not allowed.");
        }

        try {
            // Key = the name of the file
            const key = req.query.key;

            if (!key) {
                res.status(400).send({ error: "400 - Invalid request." });
                return;
            }

            const region = process.env.AWS_BUCKET_REGION!;
            const bucket = process.env.AWS_BUCKET_NAME!;

            const url = await createPresignedUrlWithClient({
                region,
                bucket,
                key: key as string,
            });

            res.status(200).send({ url });
        } catch (error: unknown) {
            if (error instanceof Error) {
                res.status(500).send({ error: error.message });
            } else {
                res.status(500).send({
                    error: "500 - An unexpected error occured.",
                });
            }
        }
    });
}