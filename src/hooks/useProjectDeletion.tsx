import { notifications } from "@mantine/notifications";
import { IconAlertCircle, IconCheck } from "@tabler/icons-react";
import { useRouter } from "next/router";

export const useProjectDeletion = (
  projectId: string,
  teamId: string,
  setDeletingProject: React.Dispatch<React.SetStateAction<boolean>>,
  onSuccess?: () => void
) => {
  const router = useRouter();

  const handleDeleteProject = async () => {
    if (!projectId) return;

    try {
      setDeletingProject(true);

      // Delete the project
      const response = await fetch(
        `/api/projects?teamId=${teamId}&projectId=${projectId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setDeletingProject(false);
        notifications.show({
          title: "Project deleted",
          message: "The project has been successfully deleted.",
          color: "green",
          icon: <IconCheck />,
        });

        if (onSuccess) {
          onSuccess();
        } else {
          router.push(`/teams/${teamId}/projects`);
        }
      }
    } catch (error) {
      console.error(error);
      setDeletingProject(false);
      notifications.show({
        title: "Couldn't delete the project",
        message:
          "An error occurred while deleting the project. We are working on a fix.",
        color: "red",
        icon: <IconAlertCircle />,
      });
    }
  };

  return { handleDeleteProject };
};
