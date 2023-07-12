import Transcript from "@/components/Transcript";
import PageHeading from "@/components/layout/heading/PageHeading";
import PrimaryLayout from "@/components/layout/primary/PrimaryLayout";
import {
  getTeamIdFromProjectId,
  validateUserIsTeamMember,
} from "@/infrastructure/services/team.service";
import { NextPageWithLayout } from "@/pages/page";
import { getSignedUrl } from "@/utils/aws";
import { formatDatesToIsoString } from "@/utils/formatPrismaDates";
import prisma from "@/utils/prisma";
import { requireAuthentication } from "@/utils/requireAuthentication";
import { File, User } from "@prisma/client";
import { IconEdit, IconTrash, IconWand } from "@tabler/icons-react";
import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import { useRef } from "react";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return requireAuthentication(context, async (session: any) => {
    const { fileId } = context.query;
    const user: User = session.user;

    try {
      let file = await prisma.file.findUniqueOrThrow({
        where: {
          id: fileId as string,
        },
        include: {
          transcript: true,
        },
      });

      file = formatDatesToIsoString(file);

      // Get the team ID of the project
      const teamId = await getTeamIdFromProjectId(file.projectId);

      if (!teamId) {
        return {
          notFound: true,
        };
      }

      // Check if the user is in the team
      await validateUserIsTeamMember(teamId, user.id);

      // GET /api/aws/getSignedUrl?key={URI} endpoint to get the signed URL for the file
      const mediaUrl = await getSignedUrl(file.uri);

      if (mediaUrl) {
        return {
          props: {
            user,
            file,
            mediaUrl,
            teamId,
          },
        };
      } else {
        return {
          notFound: true,
        };
      }
    } catch (error) {
      return {
        notFound: true,
      };
    }
  });
}

interface IFilePage {
  file: File;
  teamId: string;
  mediaUrl: string;
  user: User;
}

const FilePage: NextPageWithLayout<IFilePage> = ({
  file,
  mediaUrl,
  user,
  teamId,
}) => {
  const audioRef = useRef(null);

  // @ts-ignore
  const transcript = file.transcript.words;

  const editFile = () => {
    console.log("Edit file");
  };

  const handleDelete = () => {
    console.log("Delete file");
  };

  const handleSummarize = () => {
    console.log("summarize");
  };

  return (
    <>
      <Head>
        <title>{`${file.name} | Transcription`}</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <meta
          name="description"
          content={`File description: ${file.description}`}
        />

        <meta property="og:title" content={`${file.name} | Transcription`} />
        <meta
          property="og:description"
          content={`File description: ${file.description}`}
        />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Transcription" />
      </Head>

      <PageHeading
        title={file.name}
        description={file.description || ""}
        primaryButtonText="Summarize"
        primaryButtonIcon={<IconWand size={"1.2rem"} />}
        primaryButtonAction={handleSummarize}
        secondaryButtonMenuItems={[
          {
            title: "Edit file",
            action: editFile,
            icon: <IconEdit size={14} />,
          },
          {
            title: "Delete file",
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
            href: `/teams/${teamId}`,
          },
          {
            title: "Files",
            href: `/teams/${teamId}/projects/${file.projectId}`,
          },
        ]}
      ></PageHeading>

      <div>
        {file.type === "VIDEO" ? (
          <video
            src={mediaUrl}
            controls
            ref={audioRef}
            className="md:fixed md:bottom-2 md:right-2 md:w-1/3 z-50 w-full"
          />
        ) : (
          <audio
            src={mediaUrl}
            controls
            ref={audioRef}
            className="sticky top-4 w-full z-50"
          />
        )}

        <Transcript transcript={transcript} audioRef={audioRef} user={user} />
      </div>
    </>
  );
};

export default FilePage;
FilePage.getLayout = (page) => {
  return <PrimaryLayout>{page}</PrimaryLayout>;
};
