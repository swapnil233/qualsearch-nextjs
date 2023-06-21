import HeadingSection from "@/components/layout/heading/HeadingSection";
import PrimaryLayout from "@/components/layout/primary/PrimaryLayout";
import { NextPageWithLayout } from "@/pages/page";
import prisma from "@/utils/prisma";
import { requireAuthentication } from "@/utils/requireAuthentication";
import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { User } from "@prisma/client";
import { IconX } from "@tabler/icons-react";
import axios from "axios";
import { GetServerSideProps, GetServerSidePropsContext } from "next";

import { useState } from "react";

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  return requireAuthentication(context, async (session: any) => {
    const user: User | null = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    return {
      props: {
        user,
      },
    };
  });
};

interface TranscriptionPageProps {
  user: User | null;
}

const Transcription: NextPageWithLayout<TranscriptionPageProps> = ({
  user,
}) => {
  const [transcription, setTranscription] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleTranscribe = async () => {
    try {
      // Start loading
      setLoading(true);

      // Get transcription from GET /api/transcribe
      const res = await axios.get("/api/transcribe");

      // Set transcription
      setTranscription(res.data.transcription.replace(/\n/g, "<br />"));

      // Stop loading
      setLoading(false);
    } catch (error) {
      // Stop loading
      setLoading(false);

      // Show error notification
      notifications.show({
        id: "error-transcription",
        withCloseButton: true,
        title: "Transcription failed",
        message: "Please try again later",
        color: "red",
        icon: <IconX />,
        loading: false,
      });
    }
  };

  const handleSummarize = async () => {
    if (!transcription || transcription === "") {
      // Show error notification
      notifications.show({
        id: "error-transcription",
        withCloseButton: true,
        title: "Transcription is empty",
        message: "Please transcribe first",
        color: "red",
        icon: <IconX />,
        loading: false,
      });
      return;
    }

    if (summary && summary !== "") {
      // Show error notification
      notifications.show({
        id: "error-summary",
        withCloseButton: true,
        title: "Summary already exists",
        message: "Please transcribe again",
        color: "red",
        icon: <IconX />,
        loading: false,
      });
      return;
    }

    try {
      // Start loading
      setLoading(true);

      // Get summary from POST /api/summarize
      const res = await axios.post("/api/summarize", {
        transcription,
      });

      // Set summary
      setSummary(res.data.summary.replace(/\n/g, "<br />"));

      // Stop loading
      setLoading(false);
    } catch (error) {
      // Stop loading
      setLoading(false);

      // Show error notification
      notifications.show({
        id: "error-summary",
        withCloseButton: true,
        title: "Summarization failed",
        message: "Please try again later",
        color: "red",
        icon: <IconX />,
        loading: false,
      });
    }
  };

  return (
    <>
      <HeadingSection title="Transcription" description="Transcribe a video" />

      <Button loading={loading} onClick={handleTranscribe}>
        Transcribe
      </Button>

      <Button
        loading={loading}
        onClick={handleSummarize}
        disabled={!transcription || transcription === ""}
      >
        Summarize
      </Button>

      <p
        className="text-gray-700 dark:text-gray-400 text-lg font-normal mb-4 mt-4"
        dangerouslySetInnerHTML={{
          __html: transcription || "Transcription...",
        }}
      />
      <hr />
      <p
        className="text-gray-700 dark:text-gray-400 text-lg font-normal mb-4 mt-4"
        dangerouslySetInnerHTML={{ __html: summary || "Summary..." }}
      />
    </>
  );
};

export default Transcription;
Transcription.getLayout = (page) => {
  return <PrimaryLayout>{page}</PrimaryLayout>;
};
