import HeadingSection from "@/components/layout/heading/HeadingSection";
import PrimaryLayout from "@/components/layout/primary/PrimaryLayout";
import prisma from "@/utils/prisma";
import { requireAuthentication } from "@/utils/requireAuthentication";
import { Team } from "@prisma/client";
import { GetServerSidePropsContext } from "next";
import { NextPageWithLayout } from "../page";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return requireAuthentication(context, async (_session: any) => {
    const { teamId } = context.query;

    try {
      let team: Team | null = await prisma.team.findUnique({
        where: {
          id: teamId as string,
        },
      });

      // If the team doesn't exist, return a 404
      if (team === null) {
        return {
          notFound: true,
        };
      }

      // Turn the dates into ISO strings otherwise Next.js will throw an error
      team = {
        ...team,
        // @ts-ignore
        createdAt: team.createdAt.toISOString(),

        // @ts-ignore
        updatedAt: team.updatedAt.toISOString(),
      };

      return {
        props: {
          team,
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

interface TeamPageProps {
  team: Team;
}

const TeamPage: NextPageWithLayout<TeamPageProps> = ({ team }) => {
  return (
    <HeadingSection
      title={team.name}
      description={team.description || ""}
    ></HeadingSection>
  );
};

export default TeamPage;

TeamPage.getLayout = (page) => {
  return <PrimaryLayout>{page}</PrimaryLayout>;
};
