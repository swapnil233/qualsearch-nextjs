import TeamCard from "@/components/card/team/TeamCard";
import HeadingSection from "@/components/layout/heading/HeadingSection";
import PrimaryLayout from "@/components/layout/primary/PrimaryLayout";
import CreateTeamModal from "@/components/modal/team/CreateTeamModal";
import { NextPageWithLayout } from "@/pages/page";
import { TeamWithUsers } from "@/types";
import prisma from "@/utils/prisma";
import { requireAuthentication } from "@/utils/requireAuthentication";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { User } from "@prisma/client";
import { IconAlertCircle, IconCheck, IconPlus } from "@tabler/icons-react";
import axios from "axios";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
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

interface TeamsPageProps {
  user: User | null;
  teams: TeamWithUsers[];
}

const Teams: NextPageWithLayout<TeamsPageProps> = ({ user, teams }) => {
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

  //   POST /api/team/create
  const handleCreateNewTeam = async (
    values: { teamName: string; teamDescription: string },
    event: React.FormEvent
  ) => {
    // Prevent the default form submission
    event.preventDefault();

    try {
      setCreating(true);
      const response = await axios.post("/api/team/create", {
        teamName: form.values.teamName,
        teamDescription: form.values.teamDescription,
      });

      if (response.status === 200) {
        notifications.show({
          title: "Team created",
          message: "Your team has been created successfully.",
          color: "teal",
          icon: <IconCheck />,
        });

        const newTeam: TeamWithUsers = response.data;
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
      <HeadingSection title="Teams" description="Manage your teams." />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {showingTeams.map((team) => (
          <TeamCard key={team.id} team={team} />
        ))}

        <button
          onClick={open}
          className="border-2 border-gray-200 border-dashed rounded-lg h-60 flex items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-100 transition-colors"
        >
          <IconPlus size={40} />
        </button>
      </div>

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
