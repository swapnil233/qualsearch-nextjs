import { HttpStatus } from "@/constants/HttpStatus";
import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET")
    return res.status(HttpStatus.MethodNotAllowed).send("Method not allowed");

  const { fileId } = req.query;

  if (!fileId) return res.status(HttpStatus.BadRequest).send("Missing fileId");

  const file = await prisma.file.findUnique({
    where: {
      id: fileId as string,
    },
  });

  if (file?.status === "COMPLETED") {
    return res.status(HttpStatus.Ok).send({
      status: "COMPLETED",
    });
  } else {
    return res.status(HttpStatus.Ok).send({
      status: "PROCESSING",
    });
  }
}
