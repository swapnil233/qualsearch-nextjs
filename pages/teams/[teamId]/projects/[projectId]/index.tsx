import FileCard from "@/components/card/file/FileCard";
import PageHeading from "@/components/layout/heading/PageHeading";
import PrimaryLayout from "@/components/layout/primary/PrimaryLayout";
import DeleteNoteModal from "@/components/modal/delete/DeleteNoteModal";
import CreateFileModal from "@/components/modal/file/CreateFileModal";
import EmptyState from "@/components/states/empty/EmptyState";
import NotesOverviewDataTable from "@/components/table/data/NotesOverviewDataTable";
import { validateUserIsTeamMember } from "@/infrastructure/services/team.service";
import { NextPageWithLayout } from "@/pages/page";
import { FileWithoutTranscriptAndUri, NoteWithTagsAndCreator } from "@/types";
import { formatDatesToIsoString } from "@/utils/formatDatesToIsoString";
import prisma from "@/utils/prisma";
import { requireAuthentication } from "@/utils/requireAuthentication";
import sanitizeFileName from "@/utils/sanitizeFileName";
import { SimpleGrid, Stack, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { Project } from "@prisma/client";
import {
  IconAlertCircle,
  IconCheck,
  IconFilePlus,
  IconPencil,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import { useState } from "react";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return requireAuthentication(context, async (session: any) => {
    const { projectId } = context.query;
    const user = session.user;

    try {
      let project: Project = await prisma.project.findUniqueOrThrow({
        where: {
          id: projectId as string,
        },
      });

      // Validate if the user is a member of the team that the project belongs to
      try {
        await validateUserIsTeamMember(project.teamId, user.id);
      } catch (error) {
        // If validation fails (user is not in the team), return notFound
        return {
          notFound: true,
        };
      }

      // Get all files, don't include the transcript or the uri
      let initialFiles = await prisma.file.findMany({
        where: {
          projectId: projectId as string,
        },
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          updatedAt: true,
          type: true,
          projectId: true,
          teamId: true,
          status: true,
          transcriptRequestId: {
            select: {
              request_id: true,
            },
          },
        },
      });

      let notes: NoteWithTagsAndCreator[] = await prisma.note.findMany({
        where: {
          projectId: projectId as string,
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          tags: true,
        },
      });

      project = formatDatesToIsoString(project);
      initialFiles = formatDatesToIsoString(initialFiles);
      notes = formatDatesToIsoString(notes);

      return {
        props: {
          project,
          initialFiles,
          initialNotes: notes,
        },
      };
    } catch (error) {
      console.log(error);
      return {
        notFound: true,
      };
    }
  });
}

interface IProjectPage {
  project: Project;
  initialFiles: FileWithoutTranscriptAndUri[];
  initialNotes: NoteWithTagsAndCreator[];
}

const ProjectPage: NextPageWithLayout<IProjectPage> = ({
  project,
  initialFiles,
  initialNotes,
}) => {
  const [notes, setNotes] = useState<NoteWithTagsAndCreator[]>(initialNotes);
  const [opened, { open, close }] = useDisclosure(false);
  const [creating, setCreating] = useState(false);
  const [files, setFiles] =
    useState<FileWithoutTranscriptAndUri[]>(initialFiles);
  const [buttonText, setButtonText] = useState<string>(
    "Accept and upload file"
  );

  const [noteDeletionModalOpened, setNoteDeletionModalOpened] = useState(false);
  const [noteIdToDelete, setNoteIdToDelete] = useState<string | null>(null);
  const [deletingNote, setDeletingNote] = useState<boolean>(false);

  const form = useForm({
    initialValues: {
      fileName: "",
      fileDescription: "",
      file: null as File | null,
      multipleSpeakers: false,
      audioType: "",
      redactions: [] as string[],
      transcriptionQuality: "nova" as "nova" | "whisper" | "whisper-large",
    },
    validate: {
      fileName: (value) => (value.length > 0 ? null : "File name is required"),
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
        setButtonText("Create");
        return;
      }

      const sanitizedFileName = sanitizeFileName(values.file.name);
      const key = `teams/${project.teamId}/projects/${project.id}/files/${sanitizedFileName}`;

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

      setButtonText("Step 2/2: Transcribing file");

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
          teamId: project.teamId,
          projectId: project.id,
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

        setFiles([...files, newFile]);

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

  const openNoteDeletionModal = (noteId: string) => {
    setNoteIdToDelete(noteId as string);
    setNoteDeletionModalOpened(true);
  };

  const closeNoteDeletionModal = () => {
    setNoteIdToDelete(null);
    setNoteDeletionModalOpened(false);
  };

  const handleDeleteNote = async () => {
    if (!noteIdToDelete) return;

    try {
      setDeletingNote(true);

      // Delete the note
      const response = await fetch(`/api/notes?noteId=${noteIdToDelete}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        setDeletingNote(false);
        notifications.show({
          title: "Note deleted",
          message: "The note has been successfully deleted.",
          color: "green",
          icon: <IconCheck />,
        });
        const updatedNotes = notes.filter((note) => note.id !== noteIdToDelete);
        setNotes(updatedNotes);
        closeNoteDeletionModal();
      }
    } catch (error) {
      console.error(error);
      setDeletingNote(false);
      notifications.show({
        title: "Couldn't delete the note",
        message:
          "An error occurred while deleting the note. We are working on a fix.",
        color: "red",
        icon: <IconAlertCircle />,
      });
    }
  };

  const handleEdit = () => {
    console.log("Edit");
  };

  const handleDelete = () => {
    console.log("Delete");
  };

  return (
    <>
      <Head>
        <title>{`${project.name} | Transcription`}</title>
        <meta
          name="viewport"
          content="width=device-width, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"
        ></meta>
        <meta
          name="description"
          content={`Project description: ${project.description}`}
        />

        <meta property="og:title" content={`${project.name} | Transcription`} />
        <meta
          property="og:description"
          content={`Project description: ${project.description}`}
        />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Transcription" />
      </Head>

      <PageHeading
        title={project.name}
        description={project.description || ""}
        primaryButtonText="Add new file"
        primaryButtonAction={open}
        primaryButtonIcon={<IconFilePlus size={"1.2rem"} />}
        secondaryButtonMenuItems={[
          {
            title: "Edit project",
            action: handleEdit,
            icon: <IconPencil size={14} />,
          },
          {
            title: "Delete project",
            action: handleDelete,
            icon: <IconTrash size={14} />,
          },
        ]}
        breadcrumbs={[
          {
            title: "Home",
            href: "/",
          },
          {
            title: "Teams",
            href: "/teams",
          },
          {
            title: "Projects",
            href: `/teams/${project.teamId}`,
          },
        ]}
      ></PageHeading>

      {files.length === 0 ? (
        <EmptyState
          description="Upload this project's audio/video files to begin transcript tagging. We will transcribe it in seconds."
          imageUrl="/empty-state-images/files/empty-file.svg"
          title="Store your interview files"
          primaryButtonText="Add a file"
          primaryButtonAction={open}
        />
      ) : (
        <>
          <Stack w={"100%"}>
            <Title order={3} fw={"normal"}>
              Files
            </Title>
            <SimpleGrid
              cols={3}
              spacing={"md"}
              verticalSpacing={"md"}
              breakpoints={[
                { maxWidth: "62rem", cols: 3, spacing: "md" },
                { maxWidth: "48rem", cols: 2, spacing: "sm" },
                { maxWidth: "36rem", cols: 1, spacing: "sm" },
              ]}
            >
              {files.map((file) => (
                <FileCard key={file.id} file={file} teamId={file.teamId} />
              ))}
            </SimpleGrid>
          </Stack>
        </>
      )}

      {notes.length > 0 && (
        <Stack w={"100%"} mt={"lg"}>
          <Title order={3} fw={"normal"}>
            Overview
          </Title>
          <NotesOverviewDataTable
            notes={notes}
            teamId={project.teamId}
            projectId={project.id}
            openNoteDeletionModal={openNoteDeletionModal}
          />
        </Stack>
      )}

      <CreateFileModal
        opened={opened}
        close={close}
        creating={creating}
        handleCreateNewFile={handleCreateNewFile}
        form={form}
        buttonText={buttonText}
      />

      <DeleteNoteModal
        deleting={deletingNote}
        opened={noteDeletionModalOpened}
        close={closeNoteDeletionModal}
        handleDelete={handleDeleteNote}
      />
    </>
  );
};

export default ProjectPage;

ProjectPage.getLayout = (page) => {
  return <PrimaryLayout>{page}</PrimaryLayout>;
};
