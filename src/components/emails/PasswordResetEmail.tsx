import app from "@/lib/app";
import { host } from "@/lib/host";
import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface PasswordResetEmailProps {
  name: string;
  subject: string;
  resetLink: string;
}

export const PasswordResetEmail = ({
  name,
  subject,
  resetLink,
}: PasswordResetEmailProps) => (
  <Html>
    <Head />
    <Preview>{subject}</Preview>
    <Preview>Reset your password for {app.name}.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={paragraph}>Hi {name},</Text>
        <Text style={paragraph}>
          We received a request to reset your password for {app.name}. Click the
          button below to reset your password.
        </Text>
        <Section style={btnContainer}>
          <Button style={button} href={resetLink}>
            Reset Password
          </Button>
        </Section>
        <Text style={paragraph}>Alternatively, you can use this link:</Text>
        <Link href={resetLink}>{resetLink}</Link>
        <Text style={paragraph}>
          If you did not request a password reset, please ignore this email or
          contact support if you have questions.
        </Text>
        <Text style={paragraph}>
          Best,
          <br />
          The {app.name} team
        </Text>
        <Hr style={hr} />
        <Text style={footer}>123 Elmo Street, Toronto, ON A1A A1A Canada</Text>
      </Container>
    </Body>
  </Html>
);

PasswordResetEmail.PreviewProps = {
  name: "Hasan Iqbal",
  subject: `Reset your password for ${app.name}`,
  resetLink: `${host}/reset-password?token=abc123`,
} as PasswordResetEmailProps;

export default PasswordResetEmail;

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
};

const btnContainer = {
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#5F51E8",
  borderRadius: "3px",
  color: "#fff",
  fontSize: "16px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px",
};

const hr = {
  borderColor: "#cccccc",
  margin: "20px 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
};
