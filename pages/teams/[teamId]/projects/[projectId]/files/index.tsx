import FileCard from "@/components/card/file/FileCard";
import ProjectNotesChat from "@/components/chat/ProjectNotesChat";
import PageHeading from "@/components/layout/heading/PageHeading";
import PrimaryLayout from "@/components/layout/primary/PrimaryLayout";
import DeleteNoteModal from "@/components/modal/delete/DeleteNoteModal";
import DeleteProjectModal from "@/components/modal/delete/DeleteProjectModal";
import CreateFileModal from "@/components/modal/file/CreateFileModal";
import SharedHead from "@/components/shared/SharedHead";
import EmptyState from "@/components/states/empty/EmptyState";
import NotesOverviewDataTable from "@/components/table/data/NotesOverviewDataTable";
import { NotesProvider, useNotes } from "@/contexts/NotesContext";
import { useFileCreation } from "@/hooks/useFileCreation";
import { useNoteDeletion } from "@/hooks/useNoteDeletion";
import { useProjectDeletion } from "@/hooks/useProjectDeletion";
import { getFilesWithoutTranscriptAndUriGivenProjectId } from "@/infrastructure/services/file.service";
import { getNotesWithTagsAndCreator } from "@/infrastructure/services/note.service";
import { getProjectById } from "@/infrastructure/services/project.service";
import { validateUserIsTeamMember } from "@/infrastructure/services/team.service";
import { requireAuthentication } from "@/lib/auth/requireAuthentication";
import { NextPageWithLayout } from "@/pages/page";
import { FileWithoutTranscriptAndUri, NoteWithTagsAndCreator } from "@/types";
import {
  ActionIcon,
  Affix,
  Box,
  Group,
  Popover,
  Select,
  SimpleGrid,
  Stack,
  Title,
  rem,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Project } from "@prisma/client";
import {
  IconChevronDown,
  IconFilePlus,
  IconMessage,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";
import { GetServerSidePropsContext } from "next";
import { useEffect, useState } from "react";

// /teams/[teamId]/projects/[projectId]/files
export async function getServerSideProps(context: GetServerSidePropsContext) {
  return requireAuthentication(context, async (session: any) => {
    const { projectId } = context.query;
    const user = session.user;

    try {
      const project = await getProjectById(projectId as string);

      // Validate if the user is a member of the team that the project belongs to
      try {
        await validateUserIsTeamMember(project.teamId, user.id);
      } catch (error) {
        // If validation fails (user is not in the team), return notFound
        return {
          notFound: true,
        };
      }

      const initialFiles = await getFilesWithoutTranscriptAndUriGivenProjectId(
        projectId as string
      );

      const notes = await getNotesWithTagsAndCreator(projectId as string);

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

interface IFilesPage {
  project: Project;
  initialFiles: FileWithoutTranscriptAndUri[];
  initialNotes: NoteWithTagsAndCreator[];
}

const FilesPageContent: NextPageWithLayout<IFilesPage> = ({
  project,
  initialFiles,
}) => {
  const { notes } = useNotes();

  const [opened, { open, close }] = useDisclosure(false);
  const [files, setFiles] =
    useState<FileWithoutTranscriptAndUri[]>(initialFiles);

  const [noteDeletionModalOpened, setNoteDeletionModalOpened] = useState(false);
  const [noteIdToDelete, setNoteIdToDelete] = useState<string>("");
  const [deletingNote, setDeletingNote] = useState<boolean>(false);

  const [projectDeletionModalOpened, setProjectDeletionModalOpened] =
    useState(false);
  const [deletingProject, setDeletingProject] = useState<boolean>(false);

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
    noteIdToDelete,
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

  // Options for sorting files
  const fileSortingOptions = [
    {
      value: "nameAtoZ",
      label: "Name (A-Z)",
    },
    {
      value: "nameZtoA",
      label: "Name (Z-A)",
    },
    {
      value: "dateConducted",
      label: "Date conducted",
    },
    {
      value: "createdAt",
      label: "Upload date",
    },
  ];

  // State for sorting files
  const [sortFilesBy, setSortFilesBy] = useState<string>("nameAtoZ");

  // Select options for items per page
  const selectOptions = fileSortingOptions.map((option) => ({
    value: option.value,
    label: option.label,
  }));

  // Sort files when the sortFilesBy state changes
  useEffect(() => {
    const sortFiles = (
      files: FileWithoutTranscriptAndUri[],
      sortBy: string
    ): FileWithoutTranscriptAndUri[] => {
      // Create a new array for sorting
      const filesToSort = [...files];

      // Sort the files by the selected option
      return filesToSort.sort((a, b) => {
        if (sortBy === "dateConducted") {
          return (
            new Date(a.dateConducted).getTime() -
            new Date(b.dateConducted).getTime()
          );
        } else if (sortBy === "createdAt") {
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        } else if (sortBy === "nameAtoZ") {
          return a.name.localeCompare(b.name);
        } else if (sortBy === "nameZtoA") {
          return b.name.localeCompare(a.name);
        }
        return 0;
      });
    };

    setFiles(sortFiles(files, sortFilesBy));
  }, [sortFilesBy]);

  return (
    <>
      <SharedHead
        title={project.name}
        description={project.description || ""}
      />

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
            href: `/teams/${project.teamId}/projects`,
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
            <Group noWrap position="apart">
              <Title order={3} fw={"normal"}>
                Files
              </Title>
              <Select
                value={sortFilesBy}
                onChange={(value) => setSortFilesBy(value as string)}
                data={selectOptions}
                rightSection={<IconChevronDown size="1rem" />}
                rightSectionWidth={30}
                styles={{ rightSection: { pointerEvents: "none" } }}
              />
            </Group>
            <SimpleGrid
              cols={1}
              spacing={"md"}
              verticalSpacing={"md"}
              breakpoints={[
                { minWidth: rem(1900), cols: 4, spacing: "md" },
                { minWidth: rem(1300), cols: 3, spacing: "md" },
                { minWidth: rem(966), cols: 2, spacing: "sm" },
                { minWidth: rem(320), cols: 1, spacing: "sm" },
              ]}
            >
              {files.map((file) => (
                <FileCard key={file.id} file={file} />
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
          <Popover
            width={400}
            position="top"
            shadow="xl"
            closeOnClickOutside
            closeOnEscape
          >
            <Popover.Target>
              <ActionIcon color="blue.9" size="xl" radius="xl" variant="filled">
                <IconMessage size="1.75rem" />
              </ActionIcon>
            </Popover.Target>
            <Popover.Dropdown>
              <ProjectNotesChat projectId={project.id} />
            </Popover.Dropdown>
          </Popover>
        </Affix>
      </Box>
    </>
  );
};

const ProjectPage: NextPageWithLayout<IFilesPage> = (props) => {
  return (
    <NotesProvider initialNotes={props.initialNotes}>
      <FilesPageContent {...props} />
    </NotesProvider>
  );
};

export default ProjectPage;

ProjectPage.getLayout = (page) => {
  return <PrimaryLayout>{page}</PrimaryLayout>;
};
