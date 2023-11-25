import { notifications } from "@mantine/notifications";
import { IconAlertCircle, IconCheck } from "@tabler/icons-react";

export const useFileDeletion = (
  fileId: string,
  setDeletingFile: React.Dispatch<React.SetStateAction<boolean>>,
  closeFileDeletionModal: () => void
) => {
  const handleDeleteFile = async () => {
    if (!fileId) return;

    try {
      setDeletingFile(true);

      // Delete the file
      const response = await fetch(`/api/file?fileId=${fileId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        setDeletingFile(false);
        notifications.show({
          title: "File deleted",
          message: "The file has been successfully deleted.",
          color: "green",
          icon: <IconCheck />,
        });

        closeFileDeletionModal();
      }
    } catch (error) {
      console.error(error);
      setDeletingFile(false);
      notifications.show({
        title: "Couldn't delete the note",
        message:
          "An error occurred while deleting the note. We are working on a fix.",
        color: "red",
        icon: <IconAlertCircle />,
      });
      closeFileDeletionModal();
    }
  };

  return { handleDeleteFile };
};
