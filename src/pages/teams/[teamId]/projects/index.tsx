import ProjectCard from "@/components/card/project/ProjectCard";
import PageHeading from "@/components/layout/heading/PageHeading";
import DeleteProjectModal from "@/components/modal/delete/DeleteProjectModal";
import TeamDeletionConfirmationModal from "@/components/modal/delete/TeamDeletionConfirmationModal";
import NewInvitationModal from "@/components/modal/invitation/NewInvitationModal";
import CreateProjectModal from "@/components/modal/projects/CreateProjectModal";
import DashboardLayout from "@/components/shared/layouts/DashboardLayout";
import SharedHead from "@/components/shared/SharedHead";
import EmptyState from "@/components/states/empty/EmptyState";
import TeamTable from "@/components/table/team/TeamTable";
import { useProjectDeletion } from "@/hooks/useProjectDeletion";
import { ICreateInvitationsPayload } from "@/infrastructure/services/invitation.service";
import { getTeamAndUsersByTeamId } from "@/infrastructure/services/team.service";
import { getUser } from "@/infrastructure/services/user.service";
import { auth } from "@/lib/auth/auth";
import { HttpStatus } from "@/lib/constants/HttpStatus";
import prisma from "@/lib/prisma";
import { NextPageWithLayout } from "@/pages/page";
import { TeamWithUsers } from "@/types";
import { SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { Prisma, Project, User } from "@prisma/client";
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
import { useRouter } from "next/router";
import fetch from "node-fetch";
import { useEffect, useState } from "react";

// Page /teams/[teamId]/projects
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { teamId } = context.query;

  const session = await auth(context.req, context.res);

  if (!session) {
    return {
      redirect: {
        destination: `/signin`,
        permanent: false,
      },
    };
  }

  try {
    const user = await getUser({ id: session.user.id });

    if (!user) {
      return {
        redirect: {
          destination: `/signin`,
          permanent: false,
        },
      };
    }

    const team = await getTeamAndUsersByTeamId(teamId as string);

    if (!team) {
      return {
        notFound: true,
      };
    }

    // If the current user isn't in the team, return a 404
    if (!team?.users.some((x) => x.id === user.id)) {
      console.log("User not in team");
      return {
        notFound: true,
      };
    }

    // Include counts for files, notes and tags to display in card.
    const projects = await prisma.project.findMany({
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

    return {
      props: {
        user: JSON.parse(JSON.stringify(user)),
        team: JSON.parse(JSON.stringify(team)),
        projects: JSON.parse(JSON.stringify(projects)),
      },
    };
  } catch (error) {
    console.log(error);
    return {
      notFound: true,
    };
  }
}

interface IProjectsPage {
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

const ProjectsPage: NextPageWithLayout<IProjectsPage> = ({
  user,
  team,
  projects: initialProjects,
}) => {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);
  const [creating, setCreating] = useState(false);

  // Update projects state when page is loaded
  // Without this, the projects state does not update when user uses teams dropdown to switch teams
  useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);

  // Modals
  const [opened, { open, close }] = useDisclosure(false);

  // Delete Modal
  const [teamDeletionModalOpened, teamDeletionModalControls] =
    useDisclosure(false);
  const [deleting, setDeleting] = useState(false);

  // Project Deletion
  const [projectDeletionModalOpened, setProjectDeletionModalOpened] =
    useState<boolean>(false);
  const [deletingProject, setDeletingProject] = useState<boolean>(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const { handleDeleteProject } = useProjectDeletion(
    projectToDelete?.id || "",
    team.id,
    setDeletingProject,

    // onSuccess, remove the project from the list, close the modal and reset the projectToDelete state
    () => {
      setProjects((prevProjects) =>
        prevProjects.filter((project) => project.id !== projectToDelete?.id)
      );
      setProjectDeletionModalOpened(false);
      setProjectToDelete(null);
    }
  );
  const openProjectDeletionModal = (project: Project) => {
    setProjectToDelete(project);
    setProjectDeletionModalOpened(true);
  };

  // Invitation Modal
  const [inviteOpened, inviteControls] = useDisclosure(false);
  const [inviting, setInviting] = useState(false);

  const inviteForm = useForm<{ invitations: ICreateInvitationsPayload[] }>({
    initialValues: {
      invitations: [
        { email: "", role: "MEMBER" },
        { email: "", role: "MEMBER" },
      ],
    },
  });

  // POST /api/invitation/create
  const handleCreateNewInvitation = async (
    values: { invitations: ICreateInvitationsPayload[] },
    event?: React.FormEvent
  ) => {
    // Prevent the default form submission
    event?.preventDefault();

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
          }) as ICreateInvitationsPayload[],
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
      } else if (response.status === HttpStatus.Conflict) {
        notifications.show({
          title: "Already a member",
          message: await response.text(),
          color: "red",
          icon: <IconX size="1.1rem" />,
        });
        inviteForm.reset();
        setInviting(false);
      }
    } catch (error: any) {
      console.error(error);
      notifications.show({
        title: "Error",
        message: error.message,
        color: "red",
        icon: <IconAlertCircle />,
      });
    } finally {
      setInviting(false);
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

  // Create new project - POST /api/projects
  const handleCreateNewProject = async (
    values: { projectName: string; projectDescription: string },
    event?: React.FormEvent
  ) => {
    // Prevent the default form submission
    event?.preventDefault();

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
        setProjects((prevProjects) => [...prevProjects, newProject]);

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

  // Delete team - DELETE /api/teams
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
        teamDeletionModalControls.close();
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
      <SharedHead title={team.name} description={team.description || ""} />

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
            action: teamDeletionModalControls.open,
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

      {projects.length === 0 ? (
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
              type="container"
              spacing={"md"}
              verticalSpacing={"md"}
              cols={{
                "1900px": 4,
                "1300px": 3,
                "966px": 2,
                "320px": 1,
              }}
            >
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  fileCount={project._count.files}
                  noteCount={project._count.notes}
                  tagCount={project._count.tags}
                  onDelete={openProjectDeletionModal}
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
        opened={teamDeletionModalOpened}
        close={teamDeletionModalControls.close}
        isDeleting={deleting}
        teamName={team.name}
        handleDelete={() => handleDelete(team.id)}
      />

      <DeleteProjectModal
        opened={projectDeletionModalOpened}
        close={() => setProjectDeletionModalOpened(false)}
        handleDelete={() => handleDeleteProject()}
        deleting={deletingProject}
      />
    </>
  );
};

export default ProjectsPage;

ProjectsPage.getLayout = (page) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};
