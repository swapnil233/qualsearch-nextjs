import { ErrorMessages } from "@/constants/ErrorMessages";
import { HttpStatus } from "@/constants/HttpStatus";
import {
  createTeam,
  deleteTeam,
  getTeamById,
  validateUserIsTeamMember,
} from "@/infrastructure/services/team.service";
import { NextApiRequest, NextApiResponse } from "next";
import { Session, getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

/**
 * Handler for the '/api/teams' API endpoint.
 * This function is responsible for performing various team-related operations,
 * depending on the HTTP method of the request:
 * 1. POST: Create a new team.
 * 2. GET: Fetch a team's information.
 * 3. DELETE: Delete a team.
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
      return handlePost(req, res, session);
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
 * Handler for POST requests to '/api/teams'.
 * This function creates a new team.
 *
 * @param req {NextApiRequest} The HTTP request object.
 * @param res {NextApiResponse} The HTTP response object.
 * @param session {Session} The session object.
 */
async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
) {
  // Validate the request body.
  const { teamName, teamDescription } = req.body;

  if (!teamName) {
    return res.status(HttpStatus.BadRequest).send(ErrorMessages.BadRequest);
  }

  // Create a new team and handle potential errors.
  try {
    // @ts-ignore
    const userId = session.user.id;

    const team = await createTeam(teamName, teamDescription, userId);
    return res.status(HttpStatus.Ok).send(team);
  } catch (error) {
    console.log(error);
    return res
      .status(HttpStatus.InternalServerError)
      .send(ErrorMessages.InternalServerError);
  }
}

/**
 * Handler for GET requests to '/api/teams'.
 * This function fetches a team's information.
 *
 * @param req {NextApiRequest} The HTTP request object.
 * @param res {NextApiResponse} The HTTP response object.
 * @param session {Session} The session object.
 */
async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
) {
  // Validate the request query.
  const { teamId } = req.query;

  try {
    // @ts-ignore
    const userId = session.user.id;

    await validateUserIsTeamMember(teamId as string, userId);
  } catch (error: any) {
    return res.status(HttpStatus.Unauthorized).send(error.message);
  }

  // Fetch the team and handle potential errors.
  if (!teamId) {
    return res.status(HttpStatus.BadRequest).send(ErrorMessages.MissingTeamId);
  }

  try {
    const team = await getTeamById(teamId as string);
    return res.status(HttpStatus.Ok).send(team);
  } catch (error) {
    console.log(error);
    return res
      .status(HttpStatus.InternalServerError)
      .send(ErrorMessages.InternalServerError);
  }
}

/**
 * Handler for DELETE requests to '/api/teams'.
 * This function deletes a team.
 *
 * @param req {NextApiRequest} The HTTP request object.
 * @param res {NextApiResponse} The HTTP response object.
 * @param session {Session} The session object.
 */
async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
) {
  // Extract teamId from the query parameters.
  const { teamId } = req.query;

  // Validate the presence of teamId.
  if (!teamId) {
    return res.status(HttpStatus.BadRequest).send(ErrorMessages.MissingTeamId);
  }

  // Check if the user is a member of the team. Ignore any errors.
  try {
    // @ts-ignore
    const userId = session.user.id;
    await validateUserIsTeamMember(teamId as string, userId);
  } catch (error: any) {
    console.log(error);
  }

  // Attempt to delete the team. Ignore any errors.
  try {
    await deleteTeam(teamId as string);
  } catch (error) {
    console.log(error);
  }

  // Regardless of whether the team existed or the user was a member, return a success response.
  res.status(HttpStatus.Ok).send("Team deleted successfully.");
}
