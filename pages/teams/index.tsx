import TeamCard from "@/components/card/team/TeamCard";
import PageHeading from "@/components/layout/heading/PageHeading";
import PrimaryLayout from "@/components/layout/primary/PrimaryLayout";
import CreateTeamModal from "@/components/modal/team/CreateTeamModal";
import SharedHead from "@/components/shared/SharedHead";
import EmptyState from "@/components/states/empty/EmptyState";
import InvitationsTable, {
  IInvitationData,
} from "@/components/table/invitations/InvitationsTable";
import useTeamCreation from "@/hooks/useTeamCreation";
import useTeamInvitation from "@/hooks/useTeamInvitation";
import { getTeamsByUserAndOrder } from "@/infrastructure/services/team.service";
import { requireAuthentication } from "@/lib/auth/requireAuthentication";
import prisma from "@/lib/prisma";
import { NextPageWithLayout } from "@/pages/page";
import { TeamWithUsers } from "@/types";
import { Badge, SimpleGrid, Tabs, Text, Title, rem } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Invitation, Team, User } from "@prisma/client";
import { IconUsersGroup } from "@tabler/icons-react";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { useState } from "react";

// /teams
export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  return requireAuthentication(context, async (session: any) => {
    const user: User = session.user;

    let teams = await getTeamsByUserAndOrder(user.id, "desc");

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

const TeamsPage: NextPageWithLayout<ITeamsPage> = ({ teams, invitations }) => {
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
      <SharedHead title="Teams" description="Teams overview." />

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
          cols={1}
          spacing={"md"}
          verticalSpacing={"md"}
          breakpoints={[
            { minWidth: rem(1900), cols: 4, spacing: "md" },
            { minWidth: rem(1300), cols: 3, spacing: "md" },
            { minWidth: rem(966), cols: 2, spacing: "sm" },
            { minWidth: rem(320), cols: 1, spacing: "sm" },
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

export default TeamsPage;
TeamsPage.getLayout = (page) => {
  return <PrimaryLayout>{page}</PrimaryLayout>;
};
