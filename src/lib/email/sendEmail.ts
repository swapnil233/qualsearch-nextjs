import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

const smtpConfig: SMTPTransport.Options = {
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
};
const transporter = nodemailer.createTransport(smtpConfig);

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (data: EmailData) => {
  if (!process.env.SMTP_HOST) {
    return;
  }

  const emailDefaults = {
    from: process.env.SMTP_FROM,
  };

  await transporter.sendMail({ ...emailDefaults, ...data });
};
