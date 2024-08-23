import useTeams from "@/hooks/useTeams";
import { TeamWithUsers } from "@/types";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle, IconCheck } from "@tabler/icons-react";

const useTeamCreation = (
  setCreating: React.Dispatch<React.SetStateAction<boolean>>,
  showingTeams: TeamWithUsers[],
  setShowingTeams: React.Dispatch<React.SetStateAction<TeamWithUsers[]>>,
  close: () => void
) => {
  const form = useForm({
    initialValues: {
      teamName: "",
      teamDescription: "",
    },

    validate: {
      teamName: (value) => (value.length > 0 ? null : "Team name is required"),
    },
  });

  const { mutateTeams } = useTeams();

  // POST /api/teams - Create a new team
  const handleCreateNewTeam = async (
    values: { teamName: string; teamDescription: string },
    event?: React.FormEvent
  ) => {
    // Prevent the default form submission
    event?.preventDefault();

    try {
      setCreating(true);
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamName: form.values.teamName,
          teamDescription: form.values.teamDescription,
        }),
      });

      if (response.status === 200) {
        const data = await response.json();
        notifications.show({
          title: "Team created",
          message: "Your team has been created successfully.",
          color: "teal",
          icon: <IconCheck />,
        });

        const newTeam: TeamWithUsers = data;
        setShowingTeams([...showingTeams, newTeam]);

        form.reset();
        setCreating(false);
        close();
        mutateTeams();
      }
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

  return {
    form,
    handleCreateNewTeam,
  };
};

export default useTeamCreation;
