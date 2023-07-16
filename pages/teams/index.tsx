import TeamCard from "@/components/card/team/TeamCard";
import PageHeading from "@/components/layout/heading/PageHeading";
import PrimaryLayout from "@/components/layout/primary/PrimaryLayout";
import CreateTeamModal from "@/components/modal/team/CreateTeamModal";
import EmptyState from "@/components/states/empty/EmptyState";
import InvitationsTable, {
  IInvitationData,
} from "@/components/table/invitations/InvitationsTable";
import { getTeamsByUser } from "@/infrastructure/services/team.service";
import { NextPageWithLayout } from "@/pages/page";
import { TeamWithUsers } from "@/types";
import prisma from "@/utils/prisma";
import { requireAuthentication } from "@/utils/requireAuthentication";
import { useMantineColorScheme } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { Invitation, Team, User } from "@prisma/client";
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
    const user: User = session.user;

    let teams = await getTeamsByUser(user.id, "desc");

    // @ts-ignore
    teams = teams.map((team) => ({
      ...team,
      createdAt: team.createdAt.toISOString(),
      updatedAt: team.updatedAt.toISOString(),
    }));

    // Get user's invitations
    let invitationResponse: (Invitation & {
      team: Team;
      invitedByUser: User | null;
      invitedUser: User | null;
    })[] = await prisma.invitation.findMany({
      where: {
        invitedEmail: user.email!,
        status: "PENDING",
      },
      include: {
        team: true,
        invitedByUser: true,
        invitedUser: true,
      },
    });

    // Transform all invitations to an array usable by the <InvitationsTable /> component
    const invitations: IInvitationData[] = invitationResponse.map(
      (invitation) => ({
        id: invitation.id,
        teamName: invitation.team.name,
        teamDescription: invitation.team.description,
        createdAt: invitation.createdAt.toDateString(),
      })
    );

    return {
      props: {
        user,
        teams,
        invitations,
      },
    };
  });
};

interface ITeamsPage {
  user: User | null;
  teams: TeamWithUsers[];
  invitations: IInvitationData[];
}

const Teams: NextPageWithLayout<ITeamsPage> = ({ teams, invitations }) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [creating, setCreating] = useState(false);
  const [showingTeams, setShowingTeams] = useState<TeamWithUsers[]>(teams);
  const [showingInvitations, setShowingInvitations] =
    useState<IInvitationData[]>(invitations);
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const handleAcceptInvitation = async (invitationId: string) => {
    try {
      const response = await fetch("/api/invitation/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invitationId,
        }),
      });

      if (response.status === 200) {
        const data = await response.json();
        notifications.show({
          title: "Invitation accepted",
          message: "You have successfully accepted the invitation.",
          color: "teal",
          icon: <IconCheck />,
        });

        const updatedTeam: TeamWithUsers = data.team;
        console.log("updated team: ", updatedTeam);

        // Update the teams state
        setShowingTeams((prevTeams) => [...prevTeams, updatedTeam]);

        // Update the invitations state
        setShowingInvitations((prevInvitations) =>
          prevInvitations.filter((invitation) => invitation.id !== invitationId)
        );
      }
    } catch (error) {
      console.error(error);
      notifications.show({
        title: "Error",
        message: "An error occurred while accepting the invitation.",
        color: "red",
        icon: <IconAlertCircle />,
      });
    }
  };

  const handleDeclineInvitation = async (invitationId: string) => {
    try {
      const response = await fetch("/api/invitation/decline", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invitationId,
        }),
      });

      if (response.status === 200) {
        const data = await response.json();
        notifications.show({
          title: "Invitation declined",
          message: "You have successfully declined the invitation.",
          color: "teal",
          icon: <IconCheck />,
        });
      }
    } catch (error) {
      console.error(error);
      notifications.show({
        title: "Error",
        message: "An error occurred while accepting the invitation.",
        color: "red",
        icon: <IconAlertCircle />,
      });
    }
  };

  const form = useForm({
    initialValues: {
      teamName: "",
      teamDescription: "",
    },

    validate: {
      teamName: (value) => (value.length > 0 ? null : "Team name is required"),
    },
  });

  // POST /api/teams - Create a new team
  const handleCreateNewTeam = async (
    values: { teamName: string; teamDescription: string },
    event: React.FormEvent
  ) => {
    // Prevent the default form submission
    event.preventDefault();

    try {
      setCreating(true);
      const response = await fetch("/api/teams", {
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
        setShowingTeams([...showingTeams, newTeam]);

        form.reset();
        setCreating(false);
        close();
      }
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
          imageUrl={"/empty-state-images/teams/empty-team.svg"}
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

      {showingInvitations.length !== 0 && (
        <>
          <h2 className="text-xl font-normal flex flex-col mb-4 mt-8">
            Invitations
          </h2>
          <InvitationsTable
            invitations={showingInvitations}
            handleAcceptInvitation={handleAcceptInvitation}
            handleDeclineInvitation={handleDeclineInvitation}
          />
        </>
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
