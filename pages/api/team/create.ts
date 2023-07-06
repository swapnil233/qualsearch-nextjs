import { ErrorMessages } from "@/constants/ErrorMessages";
import { HttpStatus } from "@/constants/HttpStatus";
import { createTeam } from "@/infrastructure/services/team.service";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

/**
 * Handler for the '/api/team/create' API endpoint.
 * This function is responsible for creating a new team in the system.
 *
 * Here is a high-level overview of its flow:
 * 1. It verifies that the client is authenticated.
 * 2. It verifies that the request is a POST request and contains all required parameters.
 * 3. It creates a new team record in the database using the createTeam service function.
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

  // Only allow POST requests.
  if (req.method === "POST") {
    // Destructure the needed properties from the request body.
    const { teamName, teamDescription } = req.body;

    // Check if the teamName and teamDescription are not undefined or empty.
    if (!teamName || !teamDescription) {
      return res
        .status(HttpStatus.BadRequest)
        .send(ErrorMessages.MissingNameOrDescription);
    }

    try {
      // Use the createTeam service function to create a new team in the database.
      // @ts-expect-error
      const team = await createTeam(teamName, teamDescription, session.user.id);

      // If the creation was successful, respond with a 200 status code and the created team.
      return res.status(HttpStatus.Ok).send(team);
    } catch (error) {
      // Log the error for debugging purposes.
      console.log(error);

      // If an error occurred, respond with a 500 status code (Internal Server Error).
      return res
        .status(HttpStatus.InternalServerError)
        .send(ErrorMessages.InternalServerError);
    }
  }
}
