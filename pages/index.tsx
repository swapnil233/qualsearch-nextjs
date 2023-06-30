import PrimaryLayout from "@/components/layout/primary/PrimaryLayout";
import { NextPageWithLayout } from "@/pages/page";
import { Button, FileInput, rem } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { User } from "@prisma/client";
import { IconCheck, IconUpload, IconX } from "@tabler/icons-react";
import axios from "axios";
import { v4 } from "uuid";

import PageHeading from "@/components/layout/heading/PageHeading";
import sanitizeFileName from "@/utils/sanitizeFileName";
import { useSession } from "next-auth/react";
import { useState } from "react";

interface TranscriptionPageProps {
  user: User | null;
}

const Transcription: NextPageWithLayout<TranscriptionPageProps> = () => {
  const { data: session, status } = useSession();
  const user = session?.user;

  const [transcription, setTranscription] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFormSubmit = async (event: any) => {
    event.preventDefault();
    setUploading(true);

    // Show notification
    notifications.show({
      id: "uploading-file",
      withCloseButton: false,
      title: "Uploading file",
      message: "Please wait while we upload your file",
      icon: <IconX />,
      loading: true,
    });

    try {
      if (!user) {
        console.log("No user");
        notifications.show({
          id: "error-user",
          withCloseButton: true,
          title: "Not signed in",
          message: "Please sign in to upload a file.",
          color: "red",
          icon: <IconX />,
          loading: false,
        });
        return;
      }

      if (!file) {
        console.log("No file selected");
        notifications.show({
          id: "error-file",
          withCloseButton: true,
          title: "No file selected",
          message: "Please select a file",
          color: "red",
          icon: <IconX />,
          loading: false,
        });
        return;
      }

      const sanitizedFileName = sanitizeFileName(file.name);
      const uuid = v4();
      // @ts-ignore
      const key = `users/${user?.id}/files/${uuid}-${sanitizedFileName}`;

      const {
        data: { url: uploadUrl },
      } = await axios.get(`/api/aws/presignedUploadUrl?key=${key}`);

      const response = await axios.put(uploadUrl, file, {
        headers: { "Content-Type": file.type },
      });

      notifications.show({
        id: "success",
        withCloseButton: true,
        title: "File uploaded",
        message: "Successfully uploaded your file.",
        color: "green",
        icon: <IconCheck />,
        loading: false,
      });
    } catch (error) {
      console.log("Upload failed", error);
    } finally {
      notifications.hide("uploading-file");
      setUploading(false);
    }
  };

  const handleTranscribe = async () => {
    if (!user) {
      console.log("No user");
      notifications.show({
        id: "error-user",
        withCloseButton: true,
        title: "Not signed in",
        message: "Please sign in to transcribe a file.",
        color: "red",
        icon: <IconX />,
        loading: false,
      });
      return;
    }

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
    if (!user) {
      console.log("No user");
      notifications.show({
        id: "error-user",
        withCloseButton: true,
        title: "Not signed in",
        message: "Please sign in to summarize a file.",
        color: "red",
        icon: <IconX />,
        loading: false,
      });
      return;
    }

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
      <PageHeading title="Transcription" description="Transcribe a video" />

      <form onSubmit={handleFormSubmit}>
        <FileInput
          placeholder="Select an audio or video file..."
          label="Audio/video files"
          icon={<IconUpload size={rem(14)} />}
          withAsterisk
          // multiple
          accept="audio/*,video/*"
          value={file}
          onChange={setFile}
          sx={{ marginBottom: "1rem", marginTop: "1rem" }}
        />

        <Button type="submit" loading={uploading}>
          Submit
        </Button>
      </form>

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
