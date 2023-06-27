import { ErrorMessages } from "@/constants/ErrorMessages";
import { HttpStatus } from "@/constants/HttpStatus";
import { createProject } from "@/infrastructure/services/project.service";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

/**
 * Handler for the '/api/project/create' API endpoint.
 * This function is responsible for creating a new project in the system.
 *
 * Here is a high-level overview of its flow:
 * 1. It verifies that the client is authenticated.
 * 2. It verifies that the request is a POST request and contains all required parameters.
 * 3. It creates a new project record in the database using the createProject service function.
 *
 * @param req {NextApiRequest} The HTTP request object.
 * @param res {NextApiResponse} The HTTP response object.
 */
export default async function Handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // Server session
    const session = await getServerSession(req, res, authOptions);

    // Authenticate the request
    if (!session) {
        return res.status(HttpStatus.Unauthorized).send(ErrorMessages.Unauthorized);
    }

    // Only allow POST requests
    if (req.method === "POST") {
        // Destructure the needed properties from the request body.
        const { projectName, projectDescription, teamId } = req.body;

        // Check if the projectName and projectDescription are not undefined or empty.
        if (!projectName || !projectDescription) {
            return res.status(HttpStatus.BadRequest).send(ErrorMessages.MissingNameOrDescription);
        }

        // Check if the teamId is not undefined or empty.
        if (!teamId) {
            return res.status(HttpStatus.BadRequest).send(ErrorMessages.MissingTeamId);
        }

        try {
            // Create a new project in the database.
            const project = await createProject(projectName, projectDescription, teamId);
            return res.status(HttpStatus.Ok).send(project);
        } catch (error) {
            // Log the error for debugging purposes.
            console.log(error);

            // If an error occurred, respond with a 500 status code (Internal Server Error).
            return res.status(HttpStatus.InternalServerError).send(ErrorMessages.InternalServerError);
        }
    }
}