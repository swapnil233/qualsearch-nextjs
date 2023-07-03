import ProjectCard from "@/components/card/project/ProjectCard";
import PageHeading from "@/components/layout/heading/PageHeading";
import PrimaryLayout from "@/components/layout/primary/PrimaryLayout";
import NewInvitationModal from "@/components/modal/invitation/NewInvitationModal";
import CreateProjectModal from "@/components/modal/projects/CreateProjectModal";
import EmptyState from "@/components/states/empty/EmptyState";
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
  IconFolderPlus,
  IconPencil,
  IconTrash,
  IconUser,
  IconX,
} from "@tabler/icons-react";
import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import fetch from "node-fetch";
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

  // Invitation Modal
  const [inviteOpened, inviteControls] = useDisclosure(false);
  const [inviting, setInviting] = useState(false);

  const inviteForm = useForm({
    initialValues: {
      invitedEmail: "",
    },

    validate: {
      invitedEmail: (value) => (value.length > 0 ? null : "Email is required"),
    },
  });

  // POST /api/invitation/create
  const handleCreateNewInvitation = async (
    values: { invitedEmail: string },
    event: React.FormEvent
  ) => {
    // Prevent the default form submission
    event.preventDefault();

    try {
      setInviting(true);
      const response = await fetch("/api/invitation/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamId: team.id,
          invitedEmail: inviteForm.values.invitedEmail,
        }),
      });

      console.log(response);

      if (response.status === 201) {
        notifications.show({
          title: "Invitation sent",
          message: "Your invitation has been sent successfully.",
          color: "teal",
          icon: <IconCheck />,
        });

        inviteForm.reset();
        setInviting(false);
        inviteControls.close();
      } else if (response.status === 409) {
        notifications.show({
          title: "Invitation already sent",
          message: "An invitation has already been sent to this email.",
          color: "red",
          icon: <IconX size="1.1rem" />,
        });
        inviteForm.reset();
        setInviting(false);
      }
    } catch (error: any) {
      console.error(error);
      setInviting(false);
      notifications.show({
        title: "Error",
        message: error.message,
        color: "red",
        icon: <IconAlertCircle />,
      });
    }
  };

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

  // POST /api/project/create
  const handleCreateNewProject = async (
    values: { projectName: string; projectDescription: string },
    event: React.FormEvent
  ) => {
    // Prevent the default form submission
    event.preventDefault();

    try {
      setCreating(true);
      const response = await fetch("/api/project/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectName: form.values.projectName,
          projectDescription: form.values.projectDescription,
          teamId: team.id,
        }),
      });

      if (response.status === 200) {
        const data = await response.json();
        notifications.show({
          title: "Project created",
          message: "Your new project has been created for this team.",
          color: "teal",
          icon: <IconCheck />,
        });

        const newProject: Project = data;
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
      const response = await fetch("/api/user/role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamId: team.id,
          userId,
          role,
        }),
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

  const handleDelete = () => {
    console.log("Delete");
  };

  return (
    <>
      <Head>
        <title>{`${team.name} | Transcription`}</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <meta
          name="description"
          content={`Team description: ${team.description}`}
        />

        <meta property="og:title" content={`${team.name} | Transcription`} />
        <meta
          property="og:description"
          content={`Team description: ${team.description}`}
        />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Transcription" />
      </Head>

      <PageHeading
        title={team.name}
        description={team.description || ""}
        primaryButtonText="Create new project"
        primaryButtonAction={open}
        primaryButtonIcon={<IconFolderPlus size={"1.2rem"} />}
        secondaryButtonMenuItems={[
          {
            title: "Edit team",
            action: handleEdit,
            icon: <IconPencil size={14} />,
          },
          {
            title: "Add members",
            action: inviteControls.open,
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

      {showingProjects.length === 0 ? (
        <EmptyState
          title="Start with a project"
          description="Create a project for your UX interviews and usability tests. Think of projects as folders."
          imageUrl="/empty-project.svg"
          primaryButtonText="Create new project"
          primaryButtonAction={open}
        />
      ) : (
        <>
          <h2 className="text-xl font-normal flex flex-col mb-4">Projects</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-16">
            {showingProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </>
      )}

      <h2 className="text-xl font-normal flex flex-col mb-4">Team members</h2>
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

      <NewInvitationModal
        opened={inviteOpened}
        close={inviteControls.close}
        inviting={inviting}
        handleCreateNewInvitation={handleCreateNewInvitation}
        form={inviteForm}
      />
    </>
  );
};

export default TeamPage;

TeamPage.getLayout = (page) => {
  return <PrimaryLayout>{page}</PrimaryLayout>;
};
