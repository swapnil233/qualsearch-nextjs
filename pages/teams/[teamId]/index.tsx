import ProjectCard from "@/components/card/project/ProjectCard";
import PageHeading from "@/components/layout/heading/PageHeading";
import PrimaryLayout from "@/components/layout/primary/PrimaryLayout";
import CreateProjectModal from "@/components/modal/projects/CreateProjectModal";
import TeamTable from "@/components/table/TeamTable/TeamTable";
import { TeamWithUsers } from "@/types";
import prisma from "@/utils/prisma";
import { requireAuthentication } from "@/utils/requireAuthentication";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { Project, Team, User } from "@prisma/client";
import {
  IconAlertCircle,
  IconCheck,
  IconPencil,
  IconTrash,
  IconUser,
} from "@tabler/icons-react";
import axios from "axios";
import { GetServerSidePropsContext } from "next";
import { useState } from "react";
import { NextPageWithLayout } from "../../page";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return requireAuthentication(context, async (session: any) => {
    const { teamId } = context.query;

    try {
      const user = await prisma.user.findUnique({
        where: {
          id: session.user.id,
        },
      });

      let team: Team | null = await prisma.team.findUnique({
        where: {
          id: teamId as string,
        },
        include: {
          users: true,
        },
      });

      let projects: Project[] = await prisma.project.findMany({
        where: {
          teamId: teamId as string,
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

      // @ts-ignore
      projects = projects.map((project) => ({
        ...project,
        // @ts-ignore
        createdAt: project.createdAt.toISOString(),

        // @ts-ignore
        updatedAt: project.updatedAt.toISOString(),
      }));

      return {
        props: {
          user,
          team,
          projects,
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

interface ITeamPage {
  user: User;
  team: TeamWithUsers;
  projects: Project[];
}

const TeamPage: NextPageWithLayout<ITeamPage> = ({ user, team, projects }) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [creating, setCreating] = useState(false);
  const [showingProjects, setShowingProjects] = useState<Project[]>(projects);

  const form = useForm({
    initialValues: {
      projectName: "",
      projectDescription: "",
    },

    validate: {
      projectName: (value) =>
        value.length > 0 ? null : "Project name is required",
    },
  });

  //   POST /api/project/create
  const handleCreateNewProject = async (
    values: { projectName: string; projectDescription: string },
    event: React.FormEvent
  ) => {
    // Prevent the default form submission
    event.preventDefault();

    try {
      setCreating(true);
      const response = await axios.post("/api/project/create", {
        projectName: form.values.projectName,
        projectDescription: form.values.projectDescription,
        teamId: team.id,
      });

      if (response.status === 200) {
        notifications.show({
          title: "Project created",
          message: "Your new project has been created for this team.",
          color: "teal",
          icon: <IconCheck />,
        });

        const newProject: Project = response.data;
        setShowingProjects([...showingProjects, newProject]);

        form.reset();
        setCreating(false);
        close();
      }
    } catch (error) {
      console.error(error);
      setCreating(false);
      notifications.show({
        title: "Couldn't create a new project",
        message:
          "An error occurred while creating your project. We are working on a fix.",
        color: "red",
        icon: <IconAlertCircle />,
      });
    }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      const response = await axios.post("/api/user/role", {
        teamId: team.id,
        userId,
        role,
      });

      if (response.status === 200) {
        notifications.show({
          title: "Role changed",
          message: "The user's role has been changed.",
          color: "teal",
          icon: <IconCheck />,
        });
      }
    } catch (error) {
      console.error(error);
      notifications.show({
        title: "Couldn't change the user's role",
        message:
          "An error occurred while changing the user's role. We are working on a fix.",
        color: "red",
        icon: <IconAlertCircle />,
      });
    }
  };

  const handleEdit = () => {
    console.log("Edit");
  };

  const handleAddMembers = () => {
    console.log("Add members");
  };

  const handleDelete = () => {
    console.log("Delete");
  };

  return (
    <>
      <PageHeading
        title={team.name}
        description={team.description || ""}
        primaryButtonText="Create new project"
        primaryButtonAction={open}
        secondaryButtonMenuItems={[
          {
            title: "Edit team",
            action: handleEdit,
            icon: <IconPencil size={14} />,
          },
          {
            title: "Add members",
            action: handleAddMembers,
            icon: <IconUser size={14} />,
          },
          {
            title: "Delete",
            action: handleDelete,
            icon: <IconTrash size={14} />,
          },
        ]}
        breadcrumbs={[
          {
            title: "Home",
            href: "/",
          },
          {
            title: "Teams",
            href: "/teams",
          },
        ]}
      ></PageHeading>

      <h2 className="text-xl font-normal flex flex-col mb-4">Projects</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-16">
        {showingProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      <h2 className="text-xl font-normal flex flex-col mb-4">Team members</h2>
      {console.log(user)}
      <TeamTable
        currentUser={user}
        teamMembers={team.users}
        handleRoleChange={handleRoleChange}
      />

      <CreateProjectModal
        opened={opened}
        close={close}
        creating={creating}
        handleCreateNewProject={handleCreateNewProject}
        form={form}
      />
    </>
  );
};

export default TeamPage;

TeamPage.getLayout = (page) => {
  return <PrimaryLayout>{page}</PrimaryLayout>;
};
