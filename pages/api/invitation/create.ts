import { sendBulkTeamInvitationEmails } from "@/infrastructure/services/email.service";
import {
  createInvitations,
  getTeamNameAndMemberEmails,
  ICreateInvitationsPayload,
} from "@/infrastructure/services/invitation.service";
import { ErrorMessages } from "@/lib/constants/ErrorMessages";
import { HttpStatus } from "@/lib/constants/HttpStatus";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res
      .status(HttpStatus.MethodNotAllowed)
      .send(ErrorMessages.MethodNotAllowed);
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(HttpStatus.Unauthorized).send(ErrorMessages.Unauthorized);
  }

  const {
    teamId,
    invitations,
    invitedByUserId,
    invitedByName,
    invitedByEmail,
  }: {
    teamId: string;
    invitations: ICreateInvitationsPayload[];
    invitedByUserId: string;
    invitedByName: string;
    invitedByEmail: string;
  } = req.body;

  if (!teamId || !invitations || !invitedByUserId) {
    return res
      .status(HttpStatus.BadRequest)
      .send("One or more required parameters are missing.");
  }

  try {
    const teamAndUsers = await getTeamNameAndMemberEmails(teamId);

    if (!teamAndUsers) {
      return res
        .status(HttpStatus.NotFound)
        .send("The team you are trying to invite to does not exist.");
    }

    const existingEmails = teamAndUsers.users.map((user) => user.email);
    const emailsToInvite = invitations.map((invitation) => invitation.email);
    const emailsThatAlreadyExist = emailsToInvite.filter((email) =>
      existingEmails.includes(email)
    );

    if (emailsThatAlreadyExist.length > 0) {
      return res
        .status(HttpStatus.Conflict)
        .send(
          `The following email${emailsThatAlreadyExist.length > 1 ? "s" : ""} ${
            emailsThatAlreadyExist.length > 1 ? "are" : ""
          } already ${
            emailsThatAlreadyExist.length > 1 ? "members" : "a member"
          } of the team: ${emailsThatAlreadyExist.join(", ")}`
        );
    }

    const createdInvitations = await createInvitations(
      invitations,
      invitedByUserId,
      teamId
    );

    const failedEmailAddresses = await sendBulkTeamInvitationEmails(
      invitations,
      invitedByName,
      invitedByEmail,
      teamAndUsers.name
    );

    return res
      .status(201)
      .json({ invitations: createdInvitations, failedEmailAddresses });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "An error occurred while creating the invitation." });
  }
}
