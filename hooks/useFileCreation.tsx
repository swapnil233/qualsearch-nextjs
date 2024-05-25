import sanitizeFileName from "@/lib/sanitizeFileName";
import { FileWithoutTranscriptAndUri } from "@/types";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle, IconCheck, IconX } from "@tabler/icons-react";
import { useState } from "react";

export const useFileCreation = (
  teamId: string,
  projectId: string,
  files: FileWithoutTranscriptAndUri[],
  setFiles: React.Dispatch<React.SetStateAction<FileWithoutTranscriptAndUri[]>>,
  close: () => void
) => {
  const [creating, setCreating] = useState(false);
  const [buttonText, setButtonText] = useState<string>(
    "Accept and upload file"
  );

  const form = useForm({
    initialValues: {
      fileName: "",
      fileDescription: "",
      participantName: "",
      participantOrganization: "",
      dateConducted: new Date(),
      file: null as File | null,
      multipleSpeakers: false,
      audioType: "",
      redactions: [] as string[],
      transcriptionQuality: "nova-2" as "nova-2" | "whisper" | "whisper-large",
    },
    validate: {
      fileName: (value) => (value.length > 0 ? null : "File name is required"),
      file: (value) => (value ? null : "Please select a file"),
      participantName: (value) =>
        value.length > 0 ? null : "Participant name is required",
      participantOrganization: (value) =>
        value.length > 0 ? null : "Participant organization is required",
      dateConducted: (value) =>
        value ? null : "Date the interview was conducted is required",
      multipleSpeakers: (value) =>
        value ? null : "Please specify if there are multiple speakers",
      transcriptionQuality: (value) =>
        value ? null : "Please select a transcription quality",
    },
  });

  // POST /api/file/create
  const handleCreateNewFile = async (
    values: {
      fileName: string;
      fileDescription: string;
      participantName: string;
      participantOrganization: string;
      dateConducted: Date;
      file: File | null;
    },
    event: React.FormEvent
  ) => {
    // Prevent the default form submission
    event.preventDefault();

    try {
      setCreating(true);
      setButtonText("Step 1/2: Uploading file");

      // If no file is selected, show an error
      if (!values.file) {
        notifications.show({
          id: "error-file",
          withCloseButton: true,
          title: "No file selected",
          message: "Please select a file",
          color: "red",
          icon: <IconX />,
          loading: false,
        });
        setButtonText("Create");
        return;
      }

      const sanitizedFileName = sanitizeFileName(values.file.name);
      const key = `teams/${teamId}/projects/${projectId}/files/${sanitizedFileName}`;

      // Get the S3 presigned upload URL
      const uploadResponse = await fetch(
        `/api/aws/presignedUploadUrl?key=${key}`
      );
      const uploadData = await uploadResponse.json();
      const uploadUrl = uploadData.url;

      // Upload the file to S3
      await fetch(uploadUrl, {
        method: "PUT",
        body: values.file,
        headers: { "Content-Type": values.file.type },
      });

      setButtonText("Step 2/2: Sending file for transcription");

      // Convert file type from "type/subtype" to "VIDEO" or "AUDIO" as required by the Prisma schema
      const fileType = values.file.type.split("/")[0].toUpperCase();

      // Create the file in the database
      const response = await fetch("/api/file/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: form.values.fileName,
          fileDescription: form.values.fileDescription,
          participantName: form.values.participantName,
          participantOrganization: form.values.participantOrganization,
          dateConducted: new Date(form.values.dateConducted),
          teamId: teamId,
          projectId: projectId,
          key: key,
          type: fileType,
          multipleSpeakers: form.values.multipleSpeakers,
          audioType: form.values.audioType,
          redactions: form.values.redactions,
          transcriptionQuality: form.values.transcriptionQuality,
        }),
      });

      if (response.status === 200) {
        const newFile: FileWithoutTranscriptAndUri = await response.json();
        notifications.show({
          title: "Transcribing...",
          message:
            "We'll email you once this file has been transcribed. This shouldn't take too long.",
          color: "teal",
          icon: <IconCheck />,
        });

        setFiles((prevFiles) => [...prevFiles, newFile]);

        // Reset the form
        form.reset();

        // Set up a counter for the number of attempts to check the file status
        let attemptCounter = 0;
        const maxAttempts = 20; // 20 attempts, once per 30 seconds for 10 minutes

        // Set up an interval to check the file status every minute
        const intervalId = setInterval(async () => {
          attemptCounter++;
          if (attemptCounter >= maxAttempts) {
            clearInterval(intervalId);

            notifications.show({
              title: "File processing error",
              message:
                "The file processing took too long. Please try again later.",
              color: "red",
              icon: <IconAlertCircle />,
            });
          } else {
            // Ping the API to check the file status
            const statusResponse = await fetch(
              `/api/ping/checkFileStatus?fileId=${newFile.id}`
            );
            const statusData = await statusResponse.json();

            if (statusData.status === "COMPLETED") {
              clearInterval(intervalId);
              setFiles((prev) =>
                prev.map((file) => {
                  if (file.id === newFile.id) {
                    return {
                      ...file,
                      status: "COMPLETED",
                    };
                  } else {
                    return file;
                  }
                })
              );

              notifications.show({
                title: "File processing complete",
                message: "Your file has been successfully processed.",
                color: "green",
                icon: <IconCheck />,
              });
            }
          }
        }, 30000); // Check every 30s (30000 milliseconds)

        setCreating(false);
        setButtonText("Create");
        close();
      }
    } catch (error) {
      console.error(error);
      setCreating(false);
      setButtonText("Create");
      notifications.show({
        title: "Couldn't create a new project",
        message:
          "An error occurred while creating your project. We are working on a fix.",
        color: "red",
        icon: <IconAlertCircle />,
      });
    }
  };

  return {
    form,
    creating,
    buttonText,
    handleCreateNewFile,
  };
};
