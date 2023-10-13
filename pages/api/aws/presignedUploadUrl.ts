import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
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
  const accessKeyId = process.env.ACCESS_KEY_ID!;
  const secretAccessKey = process.env.SECRET_ACCESS_KEY!;

  const client = new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  const command = new PutObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(client, command, { expiresIn: 3600 });
};

export default async function Handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await logger(req, res, async () => {
    // If the request method is HEAD, only send the status
    if (req.method === "HEAD") {
      return res.status(200).end();
    }

    if (req.method !== "GET") {
      return res.status(405).send("Method not allowed.");
    }

    try {
      // Key = the name of the file
      const key = req.query.key;

      if (!key) {
        return res.status(400).send({ error: "400 - Invalid request." });
      }

      const region = process.env.BUCKET_REGION!;
      const bucket = process.env.BUCKET_NAME!;

      const url = await createPresignedUrlWithClient({
        region,
        bucket,
        key: key as string,
      });

      return res.status(200).send({ url });
    } catch (error: unknown) {
      if (error instanceof Error) {
        return res.status(500).send({ error: error.message });
      } else {
        return res.status(500).send({
          error: "500 - An unexpected error occured.",
        });
      }
    }
  });
}