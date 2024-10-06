import NewTeamInvitationEmail from "@/components/emails/NewTeamInvitationEmail";
import PasswordResetEmail from "@/components/emails/PasswordResetEmail";
import VerificationEmail from "@/components/emails/VerificationEmail";
import WelcomeEmail from "@/components/emails/WelcomeEmail";
import { ICreateInvitationsPayload } from "@/infrastructure/services/invitation.service";
import app from "@/lib/app";
import { EmailAddresses } from "@/lib/constants/EmailAddresses";
import { sendEmail } from "@/lib/email/sendEmail";
import { host } from "@/lib/host";
import { render } from "@react-email/components";
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

export const sendWelcomeEmail = async (name: string, email: string) => {
  const subject = `Welcome to ${app.name}`;
  const html = render(WelcomeEmail({ name, subject }));

  await sendEmail({
    to: email,
    subject,
    html,
  });
};

export const sendVerificationEmail = async (
  name: string,
  email: string,
  token: string
) => {
  const subject = `${app.name} - Verify your email`;
  const verificationLink = `${host}/verify-email?token=${token}`;

  const html = render(VerificationEmail({ name, subject, verificationLink }));
  await sendEmail({
    to: email,
    subject,
    html,
  });
};

export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  token: string
) => {
  const subject = `${app.name} - Reset Your Password`;
  const resetLink = `${host}/reset-password?token=${token}`;

  const html = render(
    PasswordResetEmail({
      name,
      subject,
      resetLink,
    })
  );

  await sendEmail({
    to: email,
    subject,
    html,
  });
};
