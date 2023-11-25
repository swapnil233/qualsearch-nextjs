import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface TranscriptionCompletedEmailProps {
  userName: string;
  fileName: string;
  linkToTranscribedFile: string;
}

export const TranscriptionCompletedEmail = ({
  linkToTranscribedFile,
  userName,
  fileName,
}: TranscriptionCompletedEmailProps) => {
  const previewText = `Transcription completed!`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Transcription completed!
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Hello <strong>{userName}</strong>,
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              The file <strong>{fileName}</strong> has finished transcribing,
              and is now available for viewing.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-[20px] py-[12px]"
                href={linkToTranscribedFile}
              >
                Go to file
              </Button>
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              or copy and paste this URL into your browser:{" "}
              <Link
                href={linkToTranscribedFile}
                className="text-blue-600 no-underline"
              >
                {linkToTranscribedFile}
              </Link>
            </Text>
            <Hr />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              This is a system-generated email, please do not reply directly to
              this email address. If you have any questions, please contact us
              at{" "}
              <Link
                href="mailto:help@qualsearch.io"
                className="text-blue-600 no-underline"
              >
                here
              </Link>
              .
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default TranscriptionCompletedEmail;
