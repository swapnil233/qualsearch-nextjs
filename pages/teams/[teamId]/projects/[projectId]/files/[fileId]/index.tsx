import Transcript from "@/components/Transcript";
import PageHeading from "@/components/layout/heading/PageHeading";
import PrimaryLayout from "@/components/layout/primary/PrimaryLayout";
import { NextPageWithLayout } from "@/pages/page";
import prisma from "@/utils/prisma";
import { requireAuthentication } from "@/utils/requireAuthentication";
import { File, User } from "@prisma/client";
import axios from "axios";
import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import { useRef } from "react";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return requireAuthentication(context, async (session: any) => {
    const { fileId } = context.query;

    try {
      const user = session.user;

      // Get the file information from DB. This will contain the URI to the file on S3, as well as the transcript JSON object from Deepgram
      let file: File = await prisma.file.findUniqueOrThrow({
        where: {
          id: fileId as string,
        },
      });

      // Change the dates to ISO strings otherwise Next.js will throw an error
      file = {
        ...file,

        // @ts-ignore
        createdAt: file.createdAt.toISOString(),

        // @ts-ignore
        updatedAt: file.updatedAt.toISOString(),
      };

      const { teamId } = await prisma.project.findUniqueOrThrow({
        where: {
          id: file.projectId,
        },
        select: {
          teamId: true,
        },
      });

      // GET /api/aws/getSignedUrl?key={URI} endpoint to get the signed URL for the file
      const baseUrl = process.env.VERCEL_URL
        ? "https://" + process.env.VERCEL_URL
        : "http://localhost:3003";
      const response = await axios.get(
        `${baseUrl}/api/aws/getSignedUrl?key=${file.uri}`
      );
      const mediaUrl = response.data.url;

      return {
        props: {
          user,
          file,
          mediaUrl,
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
  const transcript = file.transcript.results.channels[0].alternatives[0].words;

  console.log(teamId);

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
        <audio
          // src="deepest-question.mp3"
          src={mediaUrl}
          controls
          ref={audioRef}
          className="sticky top-4 w-full z-50"
        />
        <Transcript transcript={transcript} audioRef={audioRef} user={user} />
      </div>
    </>
  );
};

export default FilePage;
FilePage.getLayout = (page) => {
  return <PrimaryLayout>{page}</PrimaryLayout>;
};
