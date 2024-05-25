import { ErrorMessages } from "@/constants/ErrorMessages";
import { HttpStatus } from "@/constants/HttpStatus";
import { host } from "@/lib/host";
import prisma from "@/lib/prisma";
import { FileWithoutTranscriptAndUri } from "@/types";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import fetch from "node-fetch";
import { authOptions } from "../auth/[...nextauth]";

/**
 * Handler for the '/api/file/create' API endpoint.
 * This function is responsible for creating a new file in the user's project.
 *
 * Here is a high-level overview of its flow:
 * 1. It verifies that the client is authenticated.
 * 2. It verifies that the request is a POST request and contains all required parameters.
 * 3. It makes a request to '/api/aws/getSignedUrl' to get the signed URL for the file.
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
  // Check authentication
  const session = await getServerSession(req, res, authOptions);
  if (!session)
    return res.status(HttpStatus.Unauthorized).send(ErrorMessages.Unauthorized);

  // Check request method
  if (req.method !== "POST")
    return res
      .status(HttpStatus.MethodNotAllowed)
      .send(ErrorMessages.MethodNotAllowed);

  // Get data from request body
  const {
    fileName,
    fileDescription,
    participantName,
    participantOrganization,
    dateConducted,
    teamId,
    projectId,
    key,
    type,
    multipleSpeakers,
    audioType,
    redactions,
    transcriptionQuality,
  } = req.body;

  // File must have a name, projectId, teamId, key, and type
  if (!fileName || fileName.length === 0)
    return res
      .status(HttpStatus.BadRequest)
      .send("File name is missing from the request body");
  if (!participantName || participantName.length === 0)
    return res
      .status(HttpStatus.BadRequest)
      .send("Participant name is missing from the request body");
  if (!participantOrganization || participantOrganization.length === 0)
    return res
      .status(HttpStatus.BadRequest)
      .send("Participant organization is missing from the request body");
  if (!dateConducted || dateConducted.length === 0)
    return res
      .status(HttpStatus.BadRequest)
      .send("Date conducted is missing from the request body");
  if (!projectId || projectId.length === 0)
    return res
      .status(HttpStatus.BadRequest)
      .send("Project ID is missing from the request body");
  if (!teamId || teamId.length === 0)
    return res
      .status(HttpStatus.BadRequest)
      .send("Team ID is missing from the request body");
  if (!key || key.length === 0)
    return res
      .status(HttpStatus.BadRequest)
      .send("Key is missing from the request body");
  if (!type || type.length === 0)
    return res
      .status(HttpStatus.BadRequest)
      .send("Type is missing from the request body");

  // GET '/api/aws/getSignedUrl?key={key}'
  const response = await fetch(`${host}/api/aws/getSignedUrl?key=${key}`);

  if (!response.ok) {
    return res.status(response.status).send(await response.text());
  }

  const responseJson = await response.json();
  const signedUrl = responseJson.url;

  // Make a POST request to '/api/deepgram/' to get the rquest_id sent by Deepgram callback
  const deepgramResponse = await fetch(`${host}/api/deepgram/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      uri: signedUrl,
      multipleSpeakers,
      audioType,
      redactions,
      transcriptionQuality,
      teamId,
      projectId,
    }),
  });

  if (!deepgramResponse.ok) {
    return res
      .status(deepgramResponse.status)
      .send(await deepgramResponse.text());
  }

  // DG will respond instantly with a requestID, and use a webhook to POST at /api/webhooks/ later with the transcription once it's done
  const dgRequestId = await deepgramResponse.json();

  try {
    const file: FileWithoutTranscriptAndUri = await prisma.file.create({
      data: {
        name: fileName,
        description: fileDescription,
        participantName: participantName,
        participantOrganization: participantOrganization,
        dateConducted: dateConducted,
        teamId: teamId,
        projectId: projectId,
        uri: key,
        type: type,
        transcriptRequestId: {
          create: {
            request_id: dgRequestId.request_id,
          },
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        type: true,
        projectId: true,
        teamId: true,
        status: true,
        participantName: true,
        participantOrganization: true,
        dateConducted: true,
        transcriptRequestId: {
          select: {
            request_id: true,
          },
        },
      },
    });

    // If the creation was successful, respond with a 200 status code and the created file.
    return res.status(HttpStatus.Ok).send(file);
  } catch (error: unknown) {
    if (error instanceof Error) {
      // If there was an error creating the file, respond with a 500 status code and the error message.
      return res.status(HttpStatus.InternalServerError).send(error.message);
    } else {
      // If there was an error creating the file, respond with a 500 status code and the error message.
      return res
        .status(HttpStatus.InternalServerError)
        .send("An error occurred while creating the file.");
    }
  }
}
