import { ErrorMessages } from "@/constants/ErrorMessages";
import { HttpStatus } from "@/constants/HttpStatus";
import {
  getTeamById,
  validateUserIsTeamMember,
} from "@/infrastructure/services/team.service";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

/**
 * Handler for the GET '/api/team/[teamId]' API endpoint.
 * This function is responsible for fetching a team's information, given a team ID.
 *
 * Here is a high-level overview of its flow:
 * 1. It verifies that the client is authenticated.
 * 2. It verifies that the user requesting this resource is authorized (ie belongs in the team)
 * 2. It verifies that the request is a GET request and contains all required parameters (team ID).
 * 3. It fetches the team.
 *
 * @param req {NextApiRequest} The HTTP request object.
 * @param res {NextApiResponse} The HTTP response object.
 */
export default async function Handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get the server session.
  const session = await getServerSession(req, res, authOptions);

  // Authenticate the request.
  if (!session) {
    return res.status(HttpStatus.Unauthorized).send(ErrorMessages.Unauthorized);
  }

  // Destructure the needed properties from the request body.
  const { teamId } = req.query;
  const user = session.user;

  // Check user authorization.
  // A team's info can't be accessed unless the user trying to access it belongs to the team
  try {
    // @ts-ignore
    await validateUserIsTeamMember(teamId as string, user!.id);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(HttpStatus.Unauthorized).send(error.message);
    } else {
      console.error(
        `An unknown error occurred in /api/team/[teamId] while checking the user's authorization`
      );
      return;
    }
  }

  // Only allow GET requests.
  if (req.method === "GET") {
    // Check if the teamId is not undefined or empty.
    if (!teamId) {
      return res
        .status(HttpStatus.BadRequest)
        .send(ErrorMessages.MissingTeamId);
    }

    // Fetch the team from the database.
    try {
      const team = await getTeamById(teamId as string);

      // If the team was found, respond with a 200 status code and the team.
      return res.status(HttpStatus.Ok).send(team);
    } catch (error) {
      // Log the error for debugging purposes.
      console.log(error);

      // If an error occurred, respond with a 500 status code (Internal Server Error).
      return res
        .status(HttpStatus.InternalServerError)
        .send(ErrorMessages.InternalServerError);
    }
  } else {
    return res
      .status(HttpStatus.MethodNotAllowed)
      .send(ErrorMessages.MethodNotAllowed);
  }
}
