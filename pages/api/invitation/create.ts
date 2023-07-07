import { validateUserIsTeamMember } from "@/infrastructure/services/team.service";
import prisma from "@/utils/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

/**
 * Handler for the '/api/invitations/create' API endpoint.
 * This function is responsible for creating a new invitation.
 *
 * Here is a high-level overview of its flow:
 * 1. It verifies that the client is authenticated.
 * 2. It verifies that the request is a POST request and contains all required parameters.
 * 3. It validates that the user is a member of the team and has permissions to invite.
 * 4. It verifies that the invitee email is not already a member of the team.
 * 5. It creates a new invitation record in the database.
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
    return res.status(405).send("Method not allowed");
  }

  // Validate that the user is authenticated.
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).send("Unauthorized");
  }

  // Destructure the needed properties from the request body.
  const { invitedEmail, teamId } = req.body;

  // Validate that the required parameters are provided.
  if (!invitedEmail || !teamId) {
    return res.status(400).send("Missing parameters: invitedEmail or teamId.");
  }

  try {
    // Validate that the team exists and the user is a member.
    // @ts-ignore
    const team = await validateUserIsTeamMember(teamId, session.user.id);

    // Verify the invitee email is not already a member of the team.
    const inviteeExists = team.users.some(
      (user) => user.email === invitedEmail
    );
    if (inviteeExists) {
      return res
        .status(400)
        .send(
          "The user you are trying to invite is already a member of the team"
        );
    }

    // Verify the invitee email is not already invited to the team.
    const inviteeAlreadyInvited = await prisma.invitation.findFirst({
      where: {
        invitedEmail: invitedEmail,
        teamId: teamId,
      },
    });
    if (inviteeAlreadyInvited) {
      return res
        .status(409)
        .send("An invitation has already been sent to this email.");
    }

    // Create the new invitation.
    const invitation = await prisma.invitation.create({
      data: {
        invitedEmail: invitedEmail,
        teamId: teamId,
        // @ts-ignore
        invitedByUserId: session.user.id,
      },
    });

    // Respond with a 201 status code (Created) and the created invitation.
    return res.status(201).json(invitation);
  } catch (error) {
    console.log(error);

    // If there was a problem, respond with a 500 status code and the error message.
    return res
      .status(500)
      .json({ error: "An error occurred while creating the invitation." });
  }
}
