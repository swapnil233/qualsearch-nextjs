import { ErrorMessages } from "@/constants/ErrorMessages";
import { HttpStatus } from "@/constants/HttpStatus";
import { addUserToTeam } from "@/infrastructure/services/team.service";
import prisma from "@/utils/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

/**
 * Handler for the '/api/invitations/accept' API endpoint.
 * This function is responsible for accepting an invitation.
 *
 * Here is a high-level overview of its flow:
 * 1. It verifies that the client is authenticated.
 * 2. It verifies that the request is a POST request and contains all required parameters.
 * 3. It validates that the user is the recipient of the invitation.
 * 4. It updates the status of the invitation record in the database.
 *
 * @param req The HTTP request object.
 * @param res The HTTP response object.
 */

export default async function Handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Verify the request method is POST.
  if (req.method !== "POST") {
    return res
      .status(HttpStatus.MethodNotAllowed)
      .send(ErrorMessages.MethodNotAllowed);
  }

  // Validate that the user is authenticated.
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(HttpStatus.Unauthorized).send(ErrorMessages.Unauthorized);
  }

  // Destructure the needed properties from the request body.
  const { invitationId } = req.body;

  // Validate that the required parameters are provided.
  if (!invitationId) {
    return res.status(HttpStatus.BadRequest).send(ErrorMessages.BadRequest);
  }

  try {
    // Fetch the invitation
    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
    });

    // Validate that the invitation exists and is intended for the authenticated user.
    if (!invitation) {
      return res.status(HttpStatus.NotFound).send(ErrorMessages.NotFound);
    }

    // @ts-ignore
    if (invitation.invitedEmail !== session.user.email) {
      return res
        .status(HttpStatus.Unauthorized)
        .send(ErrorMessages.Unauthorized);
    }

    // Update the invitation status.
    const updatedInvitation = await prisma.invitation.update({
      where: { id: invitationId },
      data: {
        status: "ACCEPTED",
        invitedUser: {
          // @ts-ignore
          connect: { id: session.user.id },
        },
      },
    });

    // @ts-ignore - session.user.id won't be recognized because it comes from authOptions
    const updatedTeam = await addUserToTeam(invitation.teamId, session.user.id)

    // Respond with a 200 status code (OK) and the updated invitation.
    return res.status(HttpStatus.Ok).json({
      invitation: updatedInvitation,
      team: updatedTeam,
    });
  } catch (error) {
    console.log(error);

    // If there was a problem, respond with a 500 status code and the error message.
    return res
      .status(HttpStatus.InternalServerError)
      .send(ErrorMessages.InternalServerError);
  }
}
