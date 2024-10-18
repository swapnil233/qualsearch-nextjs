import {
  createProject,
  deleteProject,
} from "@/infrastructure/services/project.service";
import { validateUserIsTeamMember } from "@/infrastructure/services/team.service";
import { ErrorMessages } from "@/lib/constants/ErrorMessages";
import { HttpStatus } from "@/lib/constants/HttpStatus";
import {
  DeleteObjectsCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";
import { NextApiRequest, NextApiResponse } from "next";
import { Session, getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

/**
 * Handler for the '/api/projects' API endpoint.
 * This function is responsible for performing various project-related operations,
 * depending on the HTTP method of the request:
 * 1. POST: Create a new project.
 * 2. GET: Fetch a project's information.
 * 3. DELETE: Delete a project.
 *
 * For all operations, the client must be authenticated.
 *
 * @param req {NextApiRequest} The HTTP request object.
 * @param res {NextApiResponse} The HTTP response object.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get the server session and authenticate the request.
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(HttpStatus.Unauthorized).send(ErrorMessages.Unauthorized);
  }

  // Handle the request depending on its HTTP method.
  switch (req.method) {
    case "POST":
      return handlePost(req, res);
    case "DELETE":
      return handleDelete(req, res, session);
    default:
      res.setHeader("Allow", ["POST", "GET", "DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

/**
 * Handler for POST requests to '/api/projects'.
 * This function creates a new project.
 *
 * @param req {NextApiRequest} The HTTP request object.
 * @param res {NextApiResponse} The HTTP response object.
 */
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  // Destructure the needed properties from the request body.
  const { projectName, projectDescription, teamId } = req.body;

  // Project name is required
  if (!projectName) {
    return res.status(HttpStatus.BadRequest).send(ErrorMessages.BadRequest);
  }

  // Check if the teamId is not undefined or empty.
  if (!teamId) {
    return res.status(HttpStatus.BadRequest).send(ErrorMessages.MissingTeamId);
  }

  try {
    // Create a new project in the database.
    const project = await createProject(
      projectName,
      projectDescription,
      teamId
    );
    return res.status(HttpStatus.Ok).send(project);
  } catch (error) {
    // Log the error for debugging purposes.
    console.log(error);

    // If an error occurred, respond with a 500 status code (Internal Server Error).
    return res
      .status(HttpStatus.InternalServerError)
      .send(ErrorMessages.InternalServerError);
  }
}

// Delete a project
async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
) {
  const { teamId, projectId } = req.query;

  if (typeof projectId !== "string" || typeof teamId !== "string") {
    return res
      .status(HttpStatus.BadRequest)
      .send("Missing projectId or teamId");
  }

  // @ts-ignore
  const userId = session.user?.id;

  if (!userId) {
    return res.status(HttpStatus.Unauthorized).send("Invalid user session");
  }

  // Check if the user is a member of the team. Ignore any errors.
  try {
    await validateUserIsTeamMember(teamId as string, userId);
  } catch (error: any) {
    console.log(error);
    return res.status(HttpStatus.Forbidden).send("User is not a team member");
  }

  // Attempt to delete the project
  try {
    await deleteProject(projectId);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Failed to delete project");
  }

  // Delete all files in the project from S3.
  try {
    const client = new S3Client({
      region: process.env.BUCKET_REGION,
      credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID!,
        secretAccessKey: process.env.SECRET_ACCESS_KEY!,
      },
    });

    const listObjectsCommand = new ListObjectsV2Command({
      Bucket: process.env.BUCKET_NAME,
      Prefix: `teams/${teamId}/projects/${projectId}/`,
    });

    const { Contents } = await client.send(listObjectsCommand);

    if (Contents && Contents.length > 0) {
      const deleteObjectsCommand = new DeleteObjectsCommand({
        Bucket: process.env.BUCKET_NAME,
        Delete: {
          Objects: Contents.map((item) => ({ Key: item.Key! })),
        },
      });

      await client.send(deleteObjectsCommand);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("Failed to delete project files from storage");
  }

  return res.status(200).send("Project deleted successfully");
}
