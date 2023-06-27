import Transcript from "@/components/Transcript";
import HeadingSection from "@/components/layout/heading/HeadingSection";
import PrimaryLayout from "@/components/layout/primary/PrimaryLayout";
import { NextPageWithLayout } from "@/pages/page";
import prisma from "@/utils/prisma";
import { requireAuthentication } from "@/utils/requireAuthentication";
import { File, User } from "@prisma/client";
import axios from "axios";
import { GetServerSidePropsContext } from "next";
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
  mediaUrl: string;
  user: User;
}

const FilePage: NextPageWithLayout<IFilePage> = ({ file, mediaUrl, user }) => {
  const audioRef = useRef(null);

  // @ts-ignore
  const transcript = file.transcript.results.channels[0].alternatives[0].words;

  return (
    <>
      <HeadingSection
        title="Diarized Transcription"
        description="Click play, or click anywhere on the transcript to jump to that point in the audio."
      />

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
