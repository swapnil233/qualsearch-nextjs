import TeamCard from "@/components/card/team/TeamCard";
import PageHeading from "@/components/layout/heading/PageHeading";
import PrimaryLayout from "@/components/layout/primary/PrimaryLayout";
import CreateTeamModal from "@/components/modal/team/CreateTeamModal";
import EmptyState from "@/components/states/empty/EmptyState";
import InvitationsTable, {
  IInvitationData,
} from "@/components/table/invitations/InvitationsTable";
import useTeamCreation from "@/hooks/useTeamCreation";
import useTeamInvitation from "@/hooks/useTeamInvitation";
import { getTeamsByUser } from "@/infrastructure/services/team.service";
import { NextPageWithLayout } from "@/pages/page";
import { TeamWithUsers } from "@/types";
import prisma from "@/utils/prisma";
import { requireAuthentication } from "@/utils/requireAuthentication";
import { Badge, SimpleGrid, Tabs, Text, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Invitation, Team, User } from "@prisma/client";
import { IconUsersGroup } from "@tabler/icons-react";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import Head from "next/head";
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

  const { handleAcceptInvitation, handleDeclineInvitation } = useTeamInvitation(
    setShowingTeams,
    setShowingInvitations
  );

  const { form, handleCreateNewTeam } = useTeamCreation(
    setCreating,
    showingTeams,
    setShowingTeams,
    close
  );

  return (
    <>
      <Head>
        <title>{`Teams | QualSearch`}</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <meta name="description" content="Teams overview." />

        <meta property="og:title" content={`Teams | QualSearch`} />
        <meta property="og:description" content="Teams overview" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="QualSearch" />
      </Head>

      <PageHeading
        title="Teams overview"
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
        <SimpleGrid
          cols={4}
          spacing={"md"}
          verticalSpacing={"md"}
          breakpoints={[
            { maxWidth: "62rem", cols: 3, spacing: "md" },
            { maxWidth: "48rem", cols: 2, spacing: "sm" },
            { maxWidth: "36rem", cols: 1, spacing: "sm" },
          ]}
        >
          {showingTeams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </SimpleGrid>
      )}

      {showingInvitations.length !== 0 && (
        <>
          <Title order={3} fw={"normal"} mt={"3rem"} mb={"xs"}>
            Invitations
          </Title>
          <Text mb={"lg"}>Manage your team invitations.</Text>
          <Tabs color="teal" defaultValue={"received"} w={"100%"}>
            <Tabs.List>
              <Tabs.Tab
                rightSection={
                  <Badge
                    w={16}
                    h={16}
                    sx={{ pointerEvents: "none" }}
                    variant="filled"
                    size="sm"
                    p={0}
                  >
                    {showingInvitations.length}
                  </Badge>
                }
                value="received"
              >
                Recieved
              </Tabs.Tab>
              <Tabs.Tab value="sent">Sent</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="received">
              <InvitationsTable
                invitations={showingInvitations}
                handleAcceptInvitation={handleAcceptInvitation}
                handleDeclineInvitation={handleDeclineInvitation}
              />
            </Tabs.Panel>
            <Tabs.Panel value="sent">
              Under construction. Come back later to view the invitations you
              have sent.
            </Tabs.Panel>
          </Tabs>
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
