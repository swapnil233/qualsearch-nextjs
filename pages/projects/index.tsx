import HeadingSection from "@/components/layout/heading/HeadingSection";
import PrimaryLayout from "@/components/layout/primary/PrimaryLayout";
import { NextPageWithLayout } from "@/pages/page";
import prisma from "@/utils/prisma";
import { requireAuthentication } from "@/utils/requireAuthentication";
import { Project, User } from "@prisma/client";
import { GetServerSideProps, GetServerSidePropsContext } from "next";

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  return requireAuthentication(context, async (session: any) => {
    const user: User | null = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    return {
      props: {
        user,
      },
    };
  });
};

interface ProjectsPageProps {
  user: User | null;
  projects: Project[];
}

const Projects: NextPageWithLayout<ProjectsPageProps> = ({ user }) => {
  return (
    <>
      <HeadingSection
        title="Projects"
        description="Manage your team's projects"
      />
    </>
  );
};

export default Projects;
Projects.getLayout = (page) => {
  return <PrimaryLayout>{page}</PrimaryLayout>;
};
