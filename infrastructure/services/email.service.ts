import NewTeamInvitationEmail from "@/components/emails/NewTeamInvitationEmail";
import { ICreateInvitationsPayload } from "@/infrastructure/services/invitation.service";
import { EmailAddresses } from "@/lib/constants/EmailAddresses";
import { host } from "@/lib/host";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendTeamInvitationEmail = async (
  invitation: ICreateInvitationsPayload,
  invitedByName: string,
  invitedByEmail: string,
  teamName: string
): Promise<void> => {
  try {
    await resend.emails.send({
      from: EmailAddresses.Noreply,
      to: [invitation.email],
      subject: `Join ${teamName} on QualSearch.io`,
      react: NewTeamInvitationEmail({
        invitedByName,
        invitedByEmail,
        teamName,
        inviteLink: `${host}/teams`,
      }),
    });
    console.log(`Email successfully sent to ${invitation.email}`);
  } catch (error) {
    console.error(
      `Error while sending invitation email to ${invitation.email}:`,
      error
    );
    throw error;
  }
};

export const sendBulkTeamInvitationEmails = async (
  invitations: ICreateInvitationsPayload[],
  invitedByName: string,
  invitedByEmail: string,
  teamName: string
): Promise<string[]> => {
  const emailPromises = invitations.map((invitation) =>
    sendTeamInvitationEmail(invitation, invitedByName, invitedByEmail, teamName)
  );

  const emailResults = await Promise.allSettled(emailPromises);
  const failedEmails = emailResults
    .filter((result) => result.status === "rejected")
    .map((_, index) => invitations[index].email);

  if (failedEmails.length > 0) {
    console.error("Failed to send emails to:", failedEmails.join(", "));
  }

  return failedEmails;
};
