/**
 * This file is used to generate a signed URL for a file in the S3 bucket.
 */

import {
  GetObjectCommand,
  HeadObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextApiRequest, NextApiResponse } from "next";
const logger = require("@/lib/logger"); // Import the logger middleware using the 'require' syntax

const getSignedUrlWithClient = async ({
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

  // Check if the file exists in the bucket
  const headCommand = new HeadObjectCommand({ Bucket: bucket, Key: key });
  try {
    await client.send(headCommand);
  } catch (error: any) {
    if (error.name === "NoSuchKey") {
      throw new Error("File does not exist");
    }
    throw error;
  }

  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(client, command, { expiresIn: 8 * 60 * 60 }); // 8 hours
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
      // eg "teams/{team-id}/projects/{project-id}/files/{file-name}"
      const key = req.query.key;

      if (!key) {
        res.status(400).send({ error: "400 - Invalid request." });
        return;
      }

      const region = process.env.BUCKET_REGION!;
      const bucket = process.env.BUCKET_NAME!;

      const url = await getSignedUrlWithClient({
        region,
        bucket,
        key: key as string,
      });

      res.status(200).send({ url });
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).send({ error: error.message });
        console.error(error);
      } else {
        res.status(500).send({
          error: "500 - An unexpected error occured.",
        });
        console.error(error);
      }
    }
  });
}
