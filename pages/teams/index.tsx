import TeamCard from "@/components/card/team/TeamCard";
import PageHeading from "@/components/layout/heading/PageHeading";
import PrimaryLayout from "@/components/layout/primary/PrimaryLayout";
import CreateTeamModal from "@/components/modal/team/CreateTeamModal";
import EmptyState from "@/components/states/empty/EmptyState";
import { NextPageWithLayout } from "@/pages/page";
import { TeamWithUsers } from "@/types";
import prisma from "@/utils/prisma";
import { requireAuthentication } from "@/utils/requireAuthentication";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { User } from "@prisma/client";
import {
  IconAlertCircle,
  IconCheck,
  IconUsersGroup,
} from "@tabler/icons-react";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import Head from "next/head";
import fetch from "node-fetch";
import { useState } from "react";

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  return requireAuthentication(context, async (session: any) => {
    const user = session.user;

    let teams: TeamWithUsers[] = await prisma.team.findMany({
      where: {
        users: {
          some: {
            id: session.user.id,
          },
        },
      },
      include: {
        users: true,
      },
    });

    // @ts-ignore
    teams = teams.map((team) => ({
      ...team,
      createdAt: team.createdAt.toISOString(),
      updatedAt: team.updatedAt.toISOString(),
    }));

    return {
      props: {
        user,
        teams,
      },
    };
  });
};

interface ITeamsPage {
  user: User | null;
  teams: TeamWithUsers[];
}

const Teams: NextPageWithLayout<ITeamsPage> = ({ teams }) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [creating, setCreating] = useState(false);
  const [showingTeams, setShowingTeams] = useState<TeamWithUsers[]>(teams);

  const form = useForm({
    initialValues: {
      teamName: "",
      teamDescription: "",
    },

    validate: {
      teamName: (value) => (value.length > 0 ? null : "Team name is required"),
    },
  });

  // POST /api/team/create
  const handleCreateNewTeam = async (
    values: { teamName: string; teamDescription: string },
    event: React.FormEvent
  ) => {
    // Prevent the default form submission
    event.preventDefault();

    try {
      setCreating(true);
      const response = await fetch("/api/team/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamName: form.values.teamName,
          teamDescription: form.values.teamDescription,
        }),
      });

      if (response.status === 200) {
        const data = await response.json();
        notifications.show({
          title: "Team created",
          message: "Your team has been created successfully.",
          color: "teal",
          icon: <IconCheck />,
        });

        const newTeam: TeamWithUsers = data;
        console.log("new team: ", newTeam);
        setShowingTeams([...showingTeams, newTeam]);

        form.reset();
        setCreating(false);
        close();
      }

      console.log(response);
    } catch (error) {
      console.error(error);
      setCreating(false);
      notifications.show({
        title: "Error",
        message: "An error occurred while creating your team.",
        color: "red",
        icon: <IconAlertCircle />,
      });
    }
  };

  return (
    <>
      <Head>
        <title>{`Teams | Transcription`}</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <meta name="description" content="Teams overview." />

        <meta property="og:title" content={`Teams | Transcription`} />
        <meta property="og:description" content="Teams overview." />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Transcription" />
      </Head>

      <PageHeading
        title="Teams"
        primaryButtonText="Create new team"
        primaryButtonAction={open}
        primaryButtonIcon={<IconUsersGroup size={"1.2rem"} />}
        breadcrumbs={[{ title: "Home", href: "/" }]}
      />

      {showingTeams.length === 0 ? (
        <EmptyState
          title="Start collaborating"
          description="Create a team, invite your team mates, and start collaborating on your UX research."
          imageUrl="/empty-team.svg"
          primaryButtonText="Create new team"
          primaryButtonAction={open}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {showingTeams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}

      <CreateTeamModal
        opened={opened}
        close={close}
        creating={creating}
        handleCreateNewTeam={handleCreateNewTeam}
        form={form}
      />
    </>
  );
};

export default Teams;
Teams.getLayout = (page) => {
  return <PrimaryLayout>{page}</PrimaryLayout>;
};
