import FileCard from "@/components/card/file/FileCard";
import PageHeading from "@/components/layout/heading/PageHeading";
import PrimaryLayout from "@/components/layout/primary/PrimaryLayout";
import CreateFileModal from "@/components/modal/multimedia/CreateFileModal";
import EmptyState from "@/components/states/empty/EmptyState";
import { validateUserIsTeamMember } from "@/infrastructure/services/team.service";
import { NextPageWithLayout } from "@/pages/page";
import { FileWithoutTranscriptAndUri } from "@/types";
import prisma from "@/utils/prisma";
import { requireAuthentication } from "@/utils/requireAuthentication";
import sanitizeFileName from "@/utils/sanitizeFileName";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { File as PrismaFile, Project } from "@prisma/client";
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

      let files: FileWithoutTranscriptAndUri[] = await prisma.file.findMany({
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
        },
      });

      // Change the dates to ISO strings otherwise Next.js will throw an error
      project = {
        ...project,

        // @ts-ignore
        createdAt: project.createdAt.toISOString(),

        // @ts-ignore
        updatedAt: project.updatedAt.toISOString(),
      };

      // @ts-ignore
      files = files.map((file) => ({
        ...file,
        // @ts-ignore
        createdAt: file.createdAt.toLocaleString(),

        // @ts-ignore
        updatedAt: file.updatedAt.toLocaleString(),
      }));

      return {
        props: {
          project,
          files,
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
  files: FileWithoutTranscriptAndUri[];
}

const ProjectPage: NextPageWithLayout<IProjectPage> = ({ project, files }) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [creating, setCreating] = useState(false);
  const [showingFiles, setShowingFiles] =
    useState<FileWithoutTranscriptAndUri[]>(files);
  const [buttonText, setButtonText] = useState<string>("Create");

  const form = useForm({
    initialValues: {
      fileName: "",
      fileDescription: "",
      file: null as File | null,
    },

    validate: {
      fileName: (value) => (value.length > 0 ? null : "File name is required"),
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
        }),
      });

      if (response.status === 200) {
        const data = await response.json();
        notifications.show({
          title: "File created",
          message: "Your new project has been created for this team.",
          color: "teal",
          icon: <IconCheck />,
        });

        const newFile: PrismaFile = data;
        setShowingFiles([...showingFiles, newFile]);

        form.reset();
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

  const handleEdit = () => {
    console.log("Edit");
  };

  const handleAddMembers = () => {
    console.log("Add members");
  };

  const handleDelete = () => {
    console.log("Delete");
  };

  return (
    <>
      <Head>
        <title>{`${project.name} | Transcription`}</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
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

      {showingFiles.length === 0 ? (
        <EmptyState
          description="Upload this project's audio/video files to begin transcript tagging. We will transcribe it in seconds."
          imageUrl="/empty-file.svg"
          title="Store your interview files"
          primaryButtonText="Add a file"
          primaryButtonAction={open}
        />
      ) : (
        <>
          <h2 className="text-xl font-normal flex flex-col mb-4">Files</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {showingFiles.map((file) => (
              <FileCard key={file.id} file={file} teamId={file.teamId} />
            ))}
          </div>
        </>
      )}

      <CreateFileModal
        opened={opened}
        close={close}
        creating={creating}
        handleCreateNewFile={handleCreateNewFile}
        form={form}
        buttonText={buttonText}
      />
    </>
  );
};

export default ProjectPage;

ProjectPage.getLayout = (page) => {
  return <PrimaryLayout>{page}</PrimaryLayout>;
};
