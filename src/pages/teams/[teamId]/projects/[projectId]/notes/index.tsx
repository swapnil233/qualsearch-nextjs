import ProjectNotesChat from "@/components/chat/ProjectNotesChat";
import PageHeading from "@/components/layout/heading/PageHeading";
import DeleteNoteModal from "@/components/modal/delete/DeleteNoteModal";
import DashboardLayout from "@/components/shared/layouts/DashboardLayout";
import SharedHead from "@/components/shared/SharedHead";
import EmptyState from "@/components/states/empty/EmptyState";
import NotesOverviewDataTable from "@/components/table/data/NotesOverviewDataTable";
import { NotesProvider, useNotes } from "@/contexts/NotesContext";
import { useNoteDeletion } from "@/hooks/useNoteDeletion";
import { getNotesWithTagsAndCreator } from "@/infrastructure/services/note.service";
import { getProjectById } from "@/infrastructure/services/project.service";
import { validateUserIsTeamMember } from "@/infrastructure/services/team.service";
import { NextPageWithLayout } from "@/pages/page";
import { NoteWithTagsAndCreator } from "@/types";
import { ActionIcon, Affix, Box, Popover, rem } from "@mantine/core";
import { Project } from "@prisma/client";
import { IconMessage } from "@tabler/icons-react";
import { GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";
import { useState } from "react";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { teamId, projectId } = context.query;
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/signin",
        permanent: false,
      },
    };
  }

  const user = session.user;

  // Validate if the user is a member of the team that the project belongs to
  try {
    await validateUserIsTeamMember(teamId as string, user.id);
  } catch (error) {
    return {
      notFound: true,
    };
  }

  try {
    const project = await getProjectById(projectId as string);
    const notes = await getNotesWithTagsAndCreator(projectId as string);

    return {
      props: {
        project,
        initialNotes: notes,
      },
    };
  } catch (error) {
    console.log(error);
    return {
      notFound: true,
    };
  }
}

interface INotesPage {
  project: Project;
  initialNotes: NoteWithTagsAndCreator[];
}

const NotesPageContent: NextPageWithLayout<INotesPage> = ({ project }) => {
  const { notes } = useNotes();

  const [noteDeletionModalOpened, setNoteDeletionModalOpened] = useState(false);
  const [noteIdToDelete, setNoteIdToDelete] = useState<string>("");
  const [deletingNote, setDeletingNote] = useState<boolean>(false);

  const openNoteDeletionModal = (noteId: string) => {
    setNoteIdToDelete(noteId as string);
    setNoteDeletionModalOpened(true);
  };

  const closeNoteDeletionModal = () => {
    setNoteIdToDelete("");
    setNoteDeletionModalOpened(false);
  };

  const { handleDeleteNote } = useNoteDeletion(
    noteIdToDelete,
    setDeletingNote,
    closeNoteDeletionModal
  );

  return (
    <>
      <SharedHead
        title={`Notes - ${project.name}`}
        description={project.description || ""}
      />

      <PageHeading
        title={`Notes - ${project.name}`}
        description={project.description || ""}
        breadcrumbs={[
          {
            title: "Home",
            href: "/",
          },
          {
            title: "Teams",
            href: "/teams",
          },
          {
            title: "Projects",
            href: `/teams/${project.teamId}/projects`,
          },
        ]}
      />

      <Box style={{ position: "relative" }}>
        {notes.length === 0 ? (
          <EmptyState
            description="No notes available for this project. Start adding notes to see them here."
            imageUrl="/empty-state-images/notes/empty-note.svg"
            title="No Notes"
          />
        ) : (
          <NotesOverviewDataTable
            teamId={project.teamId}
            projectId={project.id}
            openNoteDeletionModal={openNoteDeletionModal}
          />
        )}

        <DeleteNoteModal
          opened={noteDeletionModalOpened}
          close={closeNoteDeletionModal}
          handleDelete={handleDeleteNote}
          deleting={deletingNote}
        />

        <Affix position={{ bottom: rem(20), right: rem(20) }}>
          <Popover
            width={400}
            position="top"
            shadow="xl"
            closeOnClickOutside
            closeOnEscape
          >
            <Popover.Target>
              <ActionIcon color="blue.9" size="xl" radius="xl" variant="filled">
                <IconMessage size="1.75rem" />
              </ActionIcon>
            </Popover.Target>
            <Popover.Dropdown>
              <ProjectNotesChat projectId={project.id} />
            </Popover.Dropdown>
          </Popover>
        </Affix>
      </Box>
    </>
  );
};

const NotesPage: NextPageWithLayout<INotesPage> = (props) => {
  return (
    <NotesProvider initialNotes={props.initialNotes}>
      <NotesPageContent {...props} />
    </NotesProvider>
  );
};

export default NotesPage;

NotesPage.getLayout = (page) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};
