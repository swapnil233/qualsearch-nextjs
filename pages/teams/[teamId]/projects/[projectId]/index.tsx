import FileCard from "@/components/card/file/FileCard";
import HeadingSection from "@/components/layout/heading/HeadingSection";
import PrimaryLayout from "@/components/layout/primary/PrimaryLayout";
import CreateFileModal from "@/components/modal/multimedia/CreateFileModal";
import { NextPageWithLayout } from "@/pages/page";
import prisma from "@/utils/prisma";
import { requireAuthentication } from "@/utils/requireAuthentication";
import sanitizeFileName from "@/utils/sanitizeFileName";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { File as PrismaFile, Project, User } from "@prisma/client";
import {
  IconAlertCircle,
  IconCheck,
  IconPlus,
  IconX,
} from "@tabler/icons-react";
import axios from "axios";
import { GetServerSidePropsContext } from "next";
import { useState } from "react";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return requireAuthentication(context, async (session: any) => {
    const { projectId } = context.query;

    try {
      const user = session.user;

      let project: Project = await prisma.project.findUniqueOrThrow({
        where: {
          id: projectId as string,
        },
      });

      // Get the team ID of the project
      const teamIdResponse = await prisma.team.findUniqueOrThrow({
        where: {
          id: project.teamId,
        },
        select: {
          id: true,
        },
      });

      const teamId = teamIdResponse.id;

      let files: PrismaFile[] = await prisma.file.findMany({
        where: {
          projectId: projectId as string,
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
        createdAt: file.createdAt.toISOString(),

        // @ts-ignore
        updatedAt: file.updatedAt.toISOString(),
      }));

      return {
        props: {
          user,
          project,
          files,
          teamId,
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
  user: User;
  project: Project;
  files: PrismaFile[];
  teamId: string;
}

const ProjectPage: NextPageWithLayout<IProjectPage> = ({
  user,
  project,
  files,
  teamId,
}) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [creating, setCreating] = useState(false);
  const [showingFiles, setShowingFiles] = useState<PrismaFile[]>(files);

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

  //   POST /api/file/create
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
        return;
      }

      const sanitizedFileName = sanitizeFileName(values.file.name);
      const key = `teams/${project.teamId}/projects/${project.id}/files/${sanitizedFileName}`;

      // Get the S3 presigned upload URL
      const {
        data: { url: uploadUrl },
      } = await axios.get(`/api/aws/presignedUploadUrl?key=${key}`);

      // Upload the file to S3
      await axios.put(uploadUrl, values.file, {
        headers: { "Content-Type": values.file.type },
      });

      // Create the file in the database
      const response = await axios.post("/api/file/create", {
        fileName: form.values.fileName,
        fileDescription: form.values.fileDescription,
        projectId: project.id,
        key,
      });

      if (response.status === 200) {
        notifications.show({
          title: "File created",
          message: "Your new project has been created for this team.",
          color: "teal",
          icon: <IconCheck />,
        });

        const newFile: PrismaFile = response.data;
        setShowingFiles([...showingFiles, newFile]);

        form.reset();
        setCreating(false);
        close();
      }
    } catch (error) {
      console.error(error);
      setCreating(false);
      notifications.show({
        title: "Couldn't create a new project",
        message:
          "An error occurred while creating your project. We are working on a fix.",
        color: "red",
        icon: <IconAlertCircle />,
      });
    }
  };

  return (
    <>
      <HeadingSection
        title={project.name}
        description={project.description || ""}
      ></HeadingSection>

      <h2 className="text-xl font-normal flex flex-col mb-4">Files</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {showingFiles.map((file) => (
          <FileCard key={file.id} file={file} teamId={teamId} />
        ))}

        <button
          onClick={open}
          className="border-2 border-gray-200 border-dashed rounded-lg h-60 flex items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-100 transition-colors"
        >
          <IconPlus size={40} />
        </button>
      </div>

      <CreateFileModal
        opened={opened}
        close={close}
        creating={creating}
        handleCreateNewFile={handleCreateNewFile}
        form={form}
      />
    </>
  );
};

export default ProjectPage;

ProjectPage.getLayout = (page) => {
  return <PrimaryLayout>{page}</PrimaryLayout>;
};
