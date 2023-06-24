import HeadingSection from "@/components/layout/heading/HeadingSection";
import PrimaryLayout from "@/components/layout/primary/PrimaryLayout";
import { NextPageWithLayout } from "@/pages/page";
import prisma from "@/utils/prisma";
import { requireAuthentication } from "@/utils/requireAuthentication";
import { File } from "@prisma/client";
import { GetServerSidePropsContext } from "next";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return requireAuthentication(context, async (_session: any) => {
    const { fileId } = context.query;

    try {
      let file: File | null = await prisma.file.findUnique({
        where: {
          id: fileId as string,
        },
      });

      // If the file doesn't exist, return a 404
      if (file === null) {
        return {
          notFound: true,
        };
      }

      // Turn the dates into ISO strings otherwise Next.js will throw an error
      file = {
        ...file,
        // @ts-ignore
        createdAt: file.createdAt.toISOString(),

        // @ts-ignore
        updatedAt: file.updatedAt.toISOString(),
      };

      return {
        props: {
          file,
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

interface FilePageProps {
  file: File;
}

const FilePage: NextPageWithLayout<FilePageProps> = ({ file }) => {
  return (
    <HeadingSection
      title={file.name}
      description={file.description || ""}
    ></HeadingSection>
  );
};

export default FilePage;

FilePage.getLayout = (page) => {
  return <PrimaryLayout>{page}</PrimaryLayout>;
};
