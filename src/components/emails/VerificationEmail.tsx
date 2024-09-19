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

interface VerificationEmailProps {
  name: string;
  subject: string;
  verificationLink: string;
}

export const VerificationEmail = ({
  name,
  subject,
  verificationLink,
}: VerificationEmailProps) => (
  <Html>
    <Head />
    <Preview>{subject}</Preview>
    <Preview>Verify your email to get started with {app.name}.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={paragraph}>Hi {name},</Text>
        <Text style={paragraph}>
          Thank you for signing up for {app.name}. Please verify your email
          address by clicking the button below.
        </Text>
        <Section style={btnContainer}>
          <Button style={button} href={verificationLink}>
            Verify Email
          </Button>
        </Section>
        <Text style={paragraph}>Alternatively, you can use this link:</Text>
        <Link href={verificationLink}>{verificationLink}</Link>
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

VerificationEmail.PreviewProps = {
  name: "Hasan Iqbal",
  subject: `Verify your email for ${app.name}`,
  verificationLink: `${host}/verify-email?token=abc123`,
} as VerificationEmailProps;

export default VerificationEmail;

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
