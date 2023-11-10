import { IMessageState } from "@/components/aside/AsideAiChat";
import ChatSuggestionButton from "@/components/buttons/ChatSuggestionButton";
import FileCard from "@/components/card/file/FileCard";
import PageHeading from "@/components/layout/heading/PageHeading";
import PrimaryLayout from "@/components/layout/primary/PrimaryLayout";
import DeleteNoteModal from "@/components/modal/delete/DeleteNoteModal";
import DeleteProjectModal from "@/components/modal/delete/DeleteProjectModal";
import CreateFileModal from "@/components/modal/file/CreateFileModal";
import EmptyState from "@/components/states/empty/EmptyState";
import NotesOverviewDataTable from "@/components/table/data/NotesOverviewDataTable";
import { useFileCreation } from "@/hooks/useFileCreation";
import { useNoteDeletion } from "@/hooks/useNoteDeletion";
import { useProjectDeletion } from "@/hooks/useProjectDeletion";
import { validateUserIsTeamMember } from "@/infrastructure/services/team.service";
import { NextPageWithLayout } from "@/pages/page";
import {
  ApiMessage,
  FileWithoutTranscriptAndUri,
  Message,
  NoteWithTagsAndCreator,
  UserMessage,
} from "@/types";
import { formatDatesToIsoString } from "@/utils/formatDatesToIsoString";
import prisma from "@/utils/prisma";
import { requireAuthentication } from "@/utils/requireAuthentication";
import {
  ActionIcon,
  Affix,
  Box,
  Button,
  Group,
  Popover,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  Title,
  rem,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { Project } from "@prisma/client";
import {
  IconFilePlus,
  IconMessage,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";
import { GetServerSidePropsContext } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import { FormEvent, KeyboardEvent, useRef, useState } from "react";

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
      let initialFiles: FileWithoutTranscriptAndUri[] =
        await prisma.file.findMany({
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
            participantName: true,
            participantOrganization: true,
            dateConducted: true,
            transcriptRequestId: {
              select: {
                request_id: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
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
          file: {
            select: {
              participantName: true,
              participantOrganization: true,
              dateConducted: true,
            },
          },
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
  const { data: session } = useSession();
  const [query, setQuery] = useState<string>("");
  const [notes, setNotes] = useState<NoteWithTagsAndCreator[]>(initialNotes);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [files, setFiles] =
    useState<FileWithoutTranscriptAndUri[]>(initialFiles);

  const [noteDeletionModalOpened, setNoteDeletionModalOpened] = useState(false);
  const [noteIdToDelete, setNoteIdToDelete] = useState<string>("");
  const [deletingNote, setDeletingNote] = useState<boolean>(false);

  const [projectDeletionModalOpened, setProjectDeletionModalOpened] =
    useState(false);
  const [deletingProject, setDeletingProject] = useState<boolean>(false);

  const [messageState, setMessageState] = useState<IMessageState>({
    messages: [
      {
        message: "What would you like to know about this interview?",
        type: "apiMessage",
      },
    ],
    history: [],
  });

  const messageListRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const handleMessageSubmit = async (
    e: FormEvent,
    suggestedMessage?: string
  ) => {
    e.preventDefault();

    const messageToSend = suggestedMessage || query.trim();

    if (!messageToSend) {
      notifications.show({
        title: "Please enter a question",
        message: "You can't send an empty message",
        color: "red",
      });
      return;
    }

    const newMessage: UserMessage = {
      type: "userMessage",
      message: messageToSend,
    };

    updateMessages(newMessage);
    setLoading(true);
    setQuery("");

    // Send the messages to the API
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: newMessage.message,
          history: messageState.history,
          projectId: project.id,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        notifications.show({
          title: "An error occurred",
          message: data.error,
          color: "red",
        });
      } else {
        const apiMessage: ApiMessage = {
          type: "apiMessage",
          message: data.text,
          sourceDocs: data.sourceDocuments,
        };

        updateMessages(apiMessage, newMessage.message, data.text);
      }
    } catch (error) {
      setError("An error occurred while fetching the data. Please try again.");
      notifications.show({
        title: "An error occurred",
        message: "An error occurred while fetching the data. Please try again.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionSubmit = (suggestion: string) => {
    return (e: FormEvent) => handleMessageSubmit(e, suggestion);
  };

  const updateMessages = (
    newMessage: Message,
    question?: string,
    answer?: string
  ) => {
    setMessageState((prevState) => ({
      ...prevState,
      messages: [...prevState.messages, newMessage],
      history:
        question && answer
          ? [...prevState.history, [question, answer]]
          : prevState.history,
    }));

    scrollToBottom();
  };

  const scrollToBottom = () => {
    messageListRef.current?.scrollTo(0, messageListRef.current.scrollHeight);
  };

  const handleEnterPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (query) {
        handleMessageSubmit(e as unknown as FormEvent);
      }
    }
  };

  const { form, creating, buttonText, handleCreateNewFile } = useFileCreation(
    project.teamId,
    project.id,
    files,
    setFiles,
    close
  );

  const openNoteDeletionModal = (noteId: string) => {
    setNoteIdToDelete(noteId as string);
    setNoteDeletionModalOpened(true);
  };

  const closeNoteDeletionModal = () => {
    setNoteIdToDelete("");
    setNoteDeletionModalOpened(false);
  };

  const { handleDeleteNote } = useNoteDeletion(
    notes,
    setNotes,
    noteIdToDelete,
    setNoteIdToDelete,
    deletingNote,
    setDeletingNote,
    closeNoteDeletionModal
  );

  const handleEdit = () => {
    console.log("Edit");
  };

  const { handleDeleteProject } = useProjectDeletion(
    project.id,
    project.teamId,
    setDeletingProject
  );

  return (
    <>
      <Head>
        <title>{`${project.name} | QualSearch`}</title>
        <meta
          name="viewport"
          content="width=device-width, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"
        ></meta>
        <meta
          name="description"
          content={`Project description: ${project.description}`}
        />

        <meta property="og:title" content={`${project.name} | QualSearch`} />
        <meta
          property="og:description"
          content={`Project description: ${project.description}`}
        />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="QualSearch" />
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
            action: () => setProjectDeletionModalOpened(true),
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
      />

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

      <Box
        style={{
          position: "relative",
        }}
      >
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
          opened={noteDeletionModalOpened}
          close={closeNoteDeletionModal}
          handleDelete={handleDeleteNote}
          deleting={deletingNote}
        />

        <DeleteProjectModal
          opened={projectDeletionModalOpened}
          close={() => setProjectDeletionModalOpened(false)}
          handleDelete={handleDeleteProject}
          deleting={deletingProject}
        />

        <Affix position={{ bottom: rem(20), right: rem(20) }}>
          <Popover width={400} position="top" shadow="xl">
            <Popover.Target>
              <ActionIcon color="blue.9" size="xl" radius="xl" variant="filled">
                <IconMessage size="1.75rem" />
              </ActionIcon>
            </Popover.Target>
            <Popover.Dropdown>
              <Stack justify="space-between">
                <Stack>
                  <Text weight={500}>
                    Chat with QualSearch AI about your notes...
                  </Text>
                  <ScrollArea h={"32rem"} ref={messageListRef}>
                    <Stack spacing={"lg"}>
                      {messageState.messages.map((message, index) => (
                        <Group
                          noWrap
                          key={`chatMessage-${index}`}
                          spacing={"xs"}
                          align="start"
                        >
                          <Image
                            src={
                              message.type === "apiMessage"
                                ? "/bot.png"
                                : session?.user?.image || "/user-image.png"
                            }
                            alt={
                              message.type === "apiMessage"
                                ? "AI"
                                : `The profile picture of the user ${session?.user?.name}`
                            }
                            width="30"
                            height="30"
                            priority
                          />
                          <Stack spacing={4}>
                            <Text weight={500}>
                              {message.type === "apiMessage"
                                ? "QualSearch AI"
                                : `${session?.user?.name || "You"}`}
                            </Text>
                            <Text style={{ whiteSpace: "pre-wrap" }}>
                              {message.message}
                            </Text>
                          </Stack>
                        </Group>
                      ))}
                    </Stack>
                  </ScrollArea>
                </Stack>
                <Stack>
                  {messageState.messages.length === 1 && (
                    <Stack spacing={"xs"}>
                      <ChatSuggestionButton
                        suggestion={"What were the major pain points?"}
                        handleSubmit={handleSuggestionSubmit(
                          "What were the major pain points?"
                        )}
                      />
                      <ChatSuggestionButton
                        suggestion={"How can the product be improved?"}
                        handleSubmit={handleSuggestionSubmit(
                          "How can the product be improved?"
                        )}
                      />
                    </Stack>
                  )}
                  <form onSubmit={handleMessageSubmit}>
                    <Stack spacing={"xs"}>
                      <Textarea
                        disabled={loading}
                        onKeyDown={handleEnterPress}
                        ref={textAreaRef}
                        autoFocus={false}
                        minRows={4}
                        maxLength={512}
                        id="userInput"
                        name="userInput"
                        placeholder={
                          loading
                            ? "Waiting for response..."
                            : "What trends do you notice about..."
                        }
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                      <Button type="submit" loading={loading}>
                        Ask
                      </Button>
                    </Stack>
                  </form>
                </Stack>
              </Stack>
            </Popover.Dropdown>
          </Popover>
        </Affix>
      </Box>
    </>
  );
};

export default ProjectPage;

ProjectPage.getLayout = (page) => {
  return <PrimaryLayout>{page}</PrimaryLayout>;
};
