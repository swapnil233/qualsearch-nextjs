import NewTeamInvitationEmail from "@/components/emails/NewTeamInvitationEmail";
import { Invitation } from "@/components/modal/invitation/NewInvitationModal";
import { EmailAddresses } from "@/constants/EmailAddresses";
import { HttpStatus } from "@/constants/HttpStatus";
import { host } from "@/utils/host";
import prisma from "@/utils/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { Resend } from "resend";
import { authOptions } from "../auth/[...nextauth]";

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
  const {
    teamId,
    invitations,
    invitedByUserId,
    invitedByName,
    invitedByEmail,
  }: {
    teamId: string;
    invitations: Invitation[];
    invitedByUserId: string;
    invitedByName: string;
    invitedByEmail: string;
  } = req.body;

  // Validate that the required parameters are provided.
  if (!teamId || !invitations || !invitedByUserId) {
    return res
      .status(HttpStatus.BadRequest)
      .send("One or more required parameters are missing.");
  }

  try {
    const teamAndUsers = await prisma.team.findUnique({
      where: {
        id: teamId,
      },
      include: {
        members: {
          select: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    if (!teamAndUsers) {
      return res
        .status(HttpStatus.NotFound)
        .send("The team you are trying to invite to does not exist");
    }

    // Check if the emails already exist
    const emails = teamAndUsers.members.map((member) => member.user.email);
    const emailsToInvite = invitations.map((invitation) => invitation.email);
    const emailsAlreadyExist = emailsToInvite.filter((email) =>
      emails.includes(email)
    );

    if (emailsAlreadyExist.length > 0) {
      return res
        .status(HttpStatus.Conflict)
        .send(
          `The following emails are already members of the team: ${emailsAlreadyExist.join(
            ", "
          )}`
        );
    }

    // Create the invitation in the database.
    const createdInvitations = await prisma.invitation.createMany({
      data: invitations.map((invitation) => ({
        invitedEmail: invitation.email,
        role: invitation.role,
        invitedByUserId: invitedByUserId,
        teamId: teamId,
      })),
      skipDuplicates: true,
    });

    // Send the invitation email(s).
    const resend = new Resend(process.env.RESEND_API_KEY);
    const emailPromises = invitations.map(
      async (invitation) =>
        await resend.emails.send({
          from: EmailAddresses.Noreply,
          to: [invitation.email],
          subject: `Join ${teamAndUsers.name} on QualSearch`,
          react: NewTeamInvitationEmail({
            invitedByName: invitedByName,
            invitedByEmail: invitedByEmail,
            teamName: teamAndUsers.name,
            inviteLink: `${host}/teams`,
          }),
        })
    );

    // Await all email sending promises and handle failures.
    const emailResults = await Promise.allSettled(emailPromises);
    const failedEmails = emailResults
      .map((result, index) =>
        result.status === "rejected" ? invitations[index].email : null
      )
      .filter((email) => email !== null);

    if (failedEmails.length > 0) {
      console.error("Failed to send emails to:", failedEmails.join(", "));
    }

    // Respond with the created invitations and any failed email notifications.
    return res
      .status(201)
      .json({ invitations: createdInvitations, failedEmails });
  } catch (error) {
    console.log(error);

    // If there was a problem, respond with a 500 status code and the error message.
    return res
      .status(500)
      .json({ error: "An error occurred while creating the invitation." });
  }
}
