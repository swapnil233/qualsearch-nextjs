import ProjectCard from "@/components/card/project/ProjectCard";
import PageHeading from "@/components/layout/heading/PageHeading";
import PrimaryLayout from "@/components/layout/primary/PrimaryLayout";
import TeamDeletionConfirmationModal from "@/components/modal/delete/TeamDeletionConfirmationModal";
import NewInvitationModal, {
  Invitation,
} from "@/components/modal/invitation/NewInvitationModal";
import CreateProjectModal from "@/components/modal/projects/CreateProjectModal";
import EmptyState from "@/components/states/empty/EmptyState";
import TeamTable from "@/components/table/team/TeamTable";
import { getTeamAndUsersByTeamId } from "@/infrastructure/services/team.service";
import { requireAuthentication } from "@/lib/auth/requireAuthentication";
import { formatDatesToIsoString } from "@/lib/formatDatesToIsoString";
import prisma from "@/lib/prisma";
import { TeamWithUsers } from "@/types";
import { SimpleGrid, Stack, Text, Title, rem } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { Prisma, User } from "@prisma/client";
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
import { useRouter } from "next/router";
import fetch from "node-fetch";
import { useState } from "react";
import { NextPageWithLayout } from "../../page";

// Page /teams/[teamId]/
export async function getServerSideProps(context: GetServerSidePropsContext) {
  return requireAuthentication(context, async (session: any) => {
    const { teamId } = context.query;
    const user = session.user;

    try {
      let team = await getTeamAndUsersByTeamId(teamId as string);

      // If the current user isn't in the team, return a 404
      if (!team?.users.some((x) => x.id === user.id)) {
        console.log("User not in team");
        return {
          notFound: true,
        };
      }

      // Include counts for files, notes and tags to display in card.
      let projects = await prisma.project.findMany({
        where: {
          teamId: teamId as string,
        },
        include: {
          _count: {
            select: {
              files: true,
              notes: true,
              tags: true,
            },
          },
        },
      });

      // If the team doesn't exist, return a 404
      if (team === null) {
        return {
          notFound: true,
        };
      }

      // Turn the dates into ISO strings otherwise Next.js will throw errors
      team = formatDatesToIsoString(team);
      projects = formatDatesToIsoString(projects);

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
  projects: Prisma.ProjectGetPayload<{
    include: {
      _count: {
        select: {
          files: true;
          notes: true;
          tags: true;
        };
      };
    };
  }>[];
}

const TeamPage: NextPageWithLayout<ITeamPage> = ({ user, team, projects }) => {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [showingProjects, setShowingProjects] = useState(projects);

  // Modals
  const [opened, { open, close }] = useDisclosure(false);

  // Invitation Modal
  const [inviteOpened, inviteControls] = useDisclosure(false);
  const [inviting, setInviting] = useState(false);

  const inviteForm = useForm<{ invitations: Invitation[] }>({
    initialValues: {
      invitations: [
        { email: "", role: "MEMBER" },
        { email: "", role: "MEMBER" },
      ],
    },
  });

  // Delete Modal
  const [deleteOpened, deleteControls] = useDisclosure(false);
  const [deleting, setDeleting] = useState(false);

  // POST /api/invitation/create
  const handleCreateNewInvitation = async (
    values: { invitations: Invitation[] },
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
          invitedByName: user.name,
          invitedByEmail: user.email,
          invitedByUserId: user.id,
          invitations: values.invitations.map((invitation) => {
            return {
              email: invitation.email,
              role: invitation.role,
            };
          }) as Invitation[],
        }),
      });

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

  // POST /api/projects
  const handleCreateNewProject = async (
    values: { projectName: string; projectDescription: string },
    event: React.FormEvent
  ) => {
    // Prevent the default form submission
    event.preventDefault();

    try {
      setCreating(true);
      const response = await fetch("/api/projects", {
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

        const newProject = data;
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

  const handleEdit = () => {
    console.log("Edit");
  };

  // POST /api/invitation/create
  const handleDelete = async (teamId: string) => {
    try {
      setDeleting(true);

      const response = await fetch(`/api/teams?teamId=${teamId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        notifications.show({
          title: "Team deleted",
          message: "Your team has been deleted.",
          color: "teal",
          icon: <IconCheck />,
        });

        setDeleting(false);
        deleteControls.close();
        router.push("/teams");
      }
    } catch (error: any) {
      console.error(error);
      setDeleting(false);
      notifications.show({
        title: "Error",
        message: error.message,
        color: "red",
        icon: <IconAlertCircle />,
      });
    }
  };

  return (
    <>
      <Head>
        <title>{`${team.name} | QualSearch`}</title>
        <meta
          name="viewport"
          content="width=device-width, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"
        ></meta>
        <meta
          name="description"
          content={`Team description: ${team.description}`}
        />

        <meta property="og:title" content={`${team.name} | QualSearch`} />
        <meta
          property="og:description"
          content={`Team description: ${team.description}`}
        />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="QualSearch" />
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
            title: "Delete team",
            action: deleteControls.open,
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
          imageUrl="/empty-state-images/projects/empty-project.svg"
          primaryButtonText="Create new project"
          primaryButtonAction={open}
        />
      ) : (
        <>
          <Stack w={"100%"}>
            <Title order={3} fw={"normal"}>
              Projects
            </Title>
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
              {showingProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  fileCount={project._count.files}
                  noteCount={project._count.notes}
                  tagCount={project._count.tags}
                />
              ))}
            </SimpleGrid>
          </Stack>
        </>
      )}

      <Title order={3} fw={"normal"} mt={"3rem"} mb={"xs"}>
        Team members
      </Title>
      <Text mb={"lg"}>
        View and manage the members of this team. Only the manager may remove
        members from the team.
      </Text>
      <TeamTable currentUser={user} teamMembers={team.users} />

      <CreateProjectModal
        opened={opened}
        close={close}
        creating={creating}
        handleCreateNewProject={handleCreateNewProject}
        form={form}
      />

      <NewInvitationModal
        opened={inviteOpened}
        close={() => {
          inviteForm.reset();
          inviteControls.close();
        }}
        inviting={inviting}
        handleCreateNewInvitation={handleCreateNewInvitation}
        form={inviteForm}
      />

      <TeamDeletionConfirmationModal
        opened={deleteOpened}
        close={deleteControls.close}
        isDeleting={deleting}
        teamName={team.name}
        handleDelete={() => handleDelete(team.id)}
      />
    </>
  );
};

export default TeamPage;

TeamPage.getLayout = (page) => {
  return <PrimaryLayout>{page}</PrimaryLayout>;
};
