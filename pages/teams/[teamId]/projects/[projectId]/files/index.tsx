import FileCard from "@/components/card/file/FileCard";
import PageHeading from "@/components/layout/heading/PageHeading";
import PrimaryLayout from "@/components/layout/primary/PrimaryLayout";
import DeleteProjectModal from "@/components/modal/delete/DeleteProjectModal";
import CreateFileModal from "@/components/modal/file/CreateFileModal";
import SharedHead from "@/components/shared/SharedHead";
import EmptyState from "@/components/states/empty/EmptyState";
import { useFileCreation } from "@/hooks/useFileCreation";
import { useProjectDeletion } from "@/hooks/useProjectDeletion";
import { getFilesWithoutTranscriptAndUriGivenProjectId } from "@/infrastructure/services/file.service";
import { getProjectById } from "@/infrastructure/services/project.service";
import { validateUserIsTeamMember } from "@/infrastructure/services/team.service";
import { NextPageWithLayout } from "@/pages/page";
import { FileWithoutTranscriptAndUri } from "@/types";
import { Box, Group, Select, SimpleGrid, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Project } from "@prisma/client";
import {
  IconChevronDown,
  IconFilePlus,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";
import { GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";
import { useEffect, useState } from "react";

// /teams/[teamId]/projects/[projectId]/files
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { projectId, teamId } = context.query;
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/signin",
        permanent: false,
      },
    };
  }

  const user = session.user;

  // Validate if the user is a member of the team that the project belongs to
  try {
    await validateUserIsTeamMember(teamId as string, user.id);
  } catch (error) {
    return {
      notFound: true,
    };
  }

  try {
    const project = await getProjectById(projectId as string);
    const files = await getFilesWithoutTranscriptAndUriGivenProjectId(
      projectId as string
    );

    return {
      props: {
        project,
        files,
      },
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
}

interface IFilesPage {
  project: Project;
  files: FileWithoutTranscriptAndUri[];
}

const FilesPage: NextPageWithLayout<IFilesPage> = ({
  project,
  files: initialFiles,
}) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [files, setFiles] =
    useState<FileWithoutTranscriptAndUri[]>(initialFiles);

  const [projectDeletionModalOpened, setProjectDeletionModalOpened] =
    useState(false);
  const [deletingProject, setDeletingProject] = useState<boolean>(false);

  // State for sorting files
  const [sortFilesBy, setSortFilesBy] = useState<string>("nameAtoZ");

  const { form, creating, buttonText, handleCreateNewFile } = useFileCreation(
    project.teamId,
    project.id,
    files,
    setFiles,
    close
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
        title={`Files - ${project.name}`}
        description={project.description || ""}
      />

      <PageHeading
        title={`Files - ${project.name}`}
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
            <Group>
              <Select
                value={sortFilesBy}
                onChange={(value) => setSortFilesBy(value as string)}
                data={selectOptions}
                rightSection={<IconChevronDown size="1rem" />}
                rightSectionWidth={30}
                // styles={{ rightSection: { pointerEvents: "none" } }}
              />
            </Group>
            <SimpleGrid
              type="container"
              cols={{
                "1900px": 4,
                "1300px": 3,
                "966px": 2,
                "320px": 1,
              }}
              spacing={"md"}
              verticalSpacing={"md"}
              // breakpoints={[
              //   { minWidth: rem(1900), cols: 4, spacing: "md" },
              //   { minWidth: rem(1300), cols: 3, spacing: "md" },
              //   { minWidth: rem(966), cols: 2, spacing: "sm" },
              //   { minWidth: rem(320), cols: 1, spacing: "sm" },
              // ]}
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
        <CreateFileModal
          opened={opened}
          close={close}
          creating={creating}
          handleCreateNewFile={handleCreateNewFile}
          form={form}
          buttonText={buttonText}
        />

        <DeleteProjectModal
          opened={projectDeletionModalOpened}
          close={() => setProjectDeletionModalOpened(false)}
          handleDelete={handleDeleteProject}
          deleting={deletingProject}
        />
      </Box>
    </>
  );
};

export default FilesPage;

FilesPage.getLayout = (page) => {
  return <PrimaryLayout>{page}</PrimaryLayout>;
};
