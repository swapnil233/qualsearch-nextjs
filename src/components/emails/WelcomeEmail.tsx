import app from "@/lib/app";
import { host } from "@/lib/host";
import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface WelcomeEmailProps {
  name: string;
  subject: string;
}

export const WelcomeEmail = ({ name, subject }: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>{subject}</Preview>
    <Preview>
      Welcome to {app.name}, the best business in the entire multiverse.
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={paragraph}>Hi {name},</Text>
        <Text style={paragraph}>
          Welcome to {app.name}, the best business in the entire multiverse.
        </Text>
        <Section style={btnContainer}>
          <Button style={button} href={`${host}/signin`}>
            Get started
          </Button>
        </Section>
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

WelcomeEmail.PreviewProps = {
  name: "Hasan Iqbal",
  subject: `Welcome to ${app.name}`,
} as WelcomeEmailProps;

export default WelcomeEmail;

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
