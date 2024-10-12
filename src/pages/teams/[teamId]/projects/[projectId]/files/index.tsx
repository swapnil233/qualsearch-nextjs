import FileCard from "@/components/card/file/FileCard";
import PageHeading from "@/components/layout/heading/PageHeading";
import DeleteProjectModal from "@/components/modal/delete/DeleteProjectModal";
import CreateFileModal from "@/components/modal/file/CreateFileModal";
import DashboardLayout from "@/components/shared/layouts/DashboardLayout";
import SharedHead from "@/components/shared/SharedHead";
import EmptyState from "@/components/states/empty/EmptyState";
import { useFileCreation } from "@/hooks/useFileCreation";
import { useProjectDeletion } from "@/hooks/useProjectDeletion";
import { getFilesWithoutTranscriptAndUriGivenProjectId } from "@/infrastructure/services/file.service";
import { getProjectById } from "@/infrastructure/services/project.service";
import { validateUserIsTeamMember } from "@/infrastructure/services/team.service";
import { auth } from "@/lib/auth/auth";
import { NextPageWithLayout } from "@/pages/page";
import { FileWithoutTranscriptAndUri } from "@/types";
import { Box, Group, Input, Select, SimpleGrid, Stack } from "@mantine/core";
import { useDebouncedValue, useDisclosure } from "@mantine/hooks";
import { Project } from "@prisma/client";
import {
  IconChevronDown,
  IconFilePlus,
  IconListSearch,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { projectId, teamId } = context.query;

  const session = await auth(context.req, context.res);

  if (!session) {
    return {
      redirect: {
        destination: `/signin`,
        permanent: false,
      },
    };
  }

  // Validate if the user is a member of the team that the project belongs to
  try {
    const user = session.user;
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
        project: JSON.parse(JSON.stringify(project)),
        files: JSON.parse(JSON.stringify(files)),
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

const fileSortingOptions = [
  { value: "nameAtoZ", label: "Name (A-Z)" },
  { value: "nameZtoA", label: "Name (Z-A)" },
  { value: "dateConducted", label: "Date conducted" },
  { value: "createdAt", label: "Upload date" },
];

const FilesPage: NextPageWithLayout<IFilesPage> = ({
  project,
  files: initialFiles,
}) => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 500);

  useEffect(() => {
    if (router.query.search) {
      setSearch(router.query.search as string);
    }
  }, [router.query.search]);

  useEffect(() => {
    const { pathname, query } = router;
    const newQuery = { ...query, search: debouncedSearch } as Record<
      string,
      string | undefined
    >;

    if (!debouncedSearch) {
      delete newQuery.search;
    }

    router.replace(
      {
        pathname,
        query: newQuery,
      },
      undefined,
      { shallow: true }
    );
  }, [debouncedSearch]);

  const [opened, { open, close }] = useDisclosure(false);
  const [files, setFiles] =
    useState<FileWithoutTranscriptAndUri[]>(initialFiles);

  const filteredFiles = useMemo(() => {
    if (!search) {
      return files;
    }
    const searchLower = search.toLowerCase();
    return files.filter((file) =>
      file.name.toLowerCase().includes(searchLower)
    );
  }, [files, search]);

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

  // Select options for items per page
  const selectOptions = useMemo(() => fileSortingOptions, []);

  // Sort files when the sortFilesBy state changes
  // Inside your component
  const sortedFiles = useMemo(() => {
    const sortFiles = (
      filesToSort: FileWithoutTranscriptAndUri[],
      sortBy: string
    ): FileWithoutTranscriptAndUri[] => {
      // Create a new array for sorting
      const filesCopy = [...filesToSort];

      // Sort the files by the selected option
      return filesCopy.sort((a, b) => {
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

    return sortFiles(filteredFiles, sortFilesBy);
  }, [filteredFiles, sortFilesBy]);

  return (
    <>
      <SharedHead
        title={`Files - ${project.name}`}
        description={project.description ?? ""}
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
        <Stack w={"100%"}>
          <Group mb="md" w="100%" align="center" wrap="wrap">
            <Input
              placeholder="Search files"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftSection={<IconListSearch size="1rem" />}
            />
            <Select
              value={sortFilesBy}
              onChange={(value) =>
                setSortFilesBy((value as string) ?? "nameAtoZ")
              }
              data={selectOptions}
              rightSection={<IconChevronDown size="1rem" />}
              rightSectionWidth={30}
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
          >
            {sortedFiles.map((file) => (
              <FileCard key={file.id} file={file} />
            ))}
          </SimpleGrid>
        </Stack>
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
  return <DashboardLayout>{page}</DashboardLayout>;
};
