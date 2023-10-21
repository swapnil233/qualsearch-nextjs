import { NoteWithTagsAndCreator } from "@/types";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle, IconCheck } from "@tabler/icons-react";

export const useNoteDeletion = (
  notes: NoteWithTagsAndCreator[],
  setNotes: React.Dispatch<React.SetStateAction<NoteWithTagsAndCreator[]>>,
  noteIdToDelete: string,
  setNoteIdToDelete: React.Dispatch<React.SetStateAction<string>>,
  deletingNote: boolean,
  setDeletingNote: React.Dispatch<React.SetStateAction<boolean>>,
  closeNoteDeletionModal: () => void
) => {
  const handleDeleteNote = async () => {
    if (!noteIdToDelete) return;

    try {
      setDeletingNote(true);

      // Delete the note
      const response = await fetch(`/api/notes?noteId=${noteIdToDelete}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        setDeletingNote(false);
        notifications.show({
          title: "Note deleted",
          message: "The note has been successfully deleted.",
          color: "green",
          icon: <IconCheck />,
        });
        const updatedNotes = notes.filter((note) => note.id !== noteIdToDelete);
        setNotes(updatedNotes);
        closeNoteDeletionModal();
      }
    } catch (error) {
      console.error(error);
      setDeletingNote(false);
      notifications.show({
        title: "Couldn't delete the note",
        message:
          "An error occurred while deleting the note. We are working on a fix.",
        color: "red",
        icon: <IconAlertCircle />,
      });
    }
  };

  return { handleDeleteNote };
};
