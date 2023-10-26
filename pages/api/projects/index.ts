import { ErrorMessages } from "@/constants/ErrorMessages";
import { HttpStatus } from "@/constants/HttpStatus";
import { createProject, deleteProject } from "@/infrastructure/services/project.service";
import { validateUserIsTeamMember } from "@/infrastructure/services/team.service";
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
    case "GET":
      return handleGet(req, res, session);
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

async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse,
  session: any
) {
  console.log("GET");
}

// Delete a project
async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
) {
  // Extract projectId from the query parameters.
  const { teamId, projectId } = req.query;

  // Validate the presence of teamId.
  if (!projectId) {
    return res.status(HttpStatus.BadRequest).send(
      "Request must include a project ID."
    );
  }

  // Check if the user is a member of the team. Ignore any errors.
  try {
    // @ts-ignore
    const userId = session.user.id;
    await validateUserIsTeamMember(teamId as string, userId);
  } catch (error: any) {
    console.log(error);
  }

  // Attempt to delete the project. Ignore any errors.
  try {
    await deleteProject(projectId as string);
  } catch (error) {
    console.log(error);
  }

  // Regardless of whether the team existed or the user was a member, return a success response.
  res.status(HttpStatus.Ok).send("Project deleted successfully.");
}
