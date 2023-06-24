import HeadingSection from "@/components/layout/heading/HeadingSection";
import PrimaryLayout from "@/components/layout/primary/PrimaryLayout";
import { NextPageWithLayout } from "@/pages/page";
import prisma from "@/utils/prisma";
import { requireAuthentication } from "@/utils/requireAuthentication";
import { Project } from "@prisma/client";
import { GetServerSidePropsContext } from "next";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return requireAuthentication(context, async (_session: any) => {
    const { projectId } = context.query;

    try {
      let project: Project | null = await prisma.project.findUnique({
        where: {
          id: projectId as string,
        },
      });

      // If the project doesn't exist, return a 404
      if (project === null) {
        return {
          notFound: true,
        };
      }

      // Turn the dates into ISO strings otherwise Next.js will throw an error
      project = {
        ...project,
        // @ts-ignore
        createdAt: project.createdAt.toISOString(),

        // @ts-ignore
        updatedAt: project.updatedAt.toISOString(),
      };

      return {
        props: {
          project,
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

interface ProjectPageProps {
  project: Project;
}

const ProjectPage: NextPageWithLayout<ProjectPageProps> = ({ project }) => {
  return (
    <HeadingSection
      title={project.name}
      description={project.description || ""}
    ></HeadingSection>
  );
};

export default ProjectPage;

ProjectPage.getLayout = (page) => {
  return <PrimaryLayout>{page}</PrimaryLayout>;
};
