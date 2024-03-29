import { IInvitationData } from "@/components/table/invitations/InvitationsTable";
import { TeamWithUsers } from "@/types";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle, IconCheck } from "@tabler/icons-react";

const useTeamInvitation = (
  setShowingTeams: React.Dispatch<React.SetStateAction<TeamWithUsers[]>>,
  setShowingInvitations: React.Dispatch<React.SetStateAction<IInvitationData[]>>
) => {
  const handleAcceptInvitation = async (invitationId: string) => {
    try {
      const response = await fetch("/api/invitation/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invitationId,
        }),
      });

      if (response.status === 200) {
        const data = await response.json();
        notifications.show({
          title: "Invitation accepted",
          message: "You have successfully accepted the invitation.",
          color: "teal",
          icon: <IconCheck />,
        });

        const updatedTeam: TeamWithUsers = data.team;
        console.log("updated team: ", updatedTeam);

        // Update the teams state
        setShowingTeams((prevTeams) => [...prevTeams, updatedTeam]);

        // Update the invitations state
        setShowingInvitations((prevInvitations) =>
          prevInvitations.filter((invitation) => invitation.id !== invitationId)
        );
      }
    } catch (error) {
      console.error(error);
      notifications.show({
        title: "Error",
        message: "An error occurred while accepting the invitation.",
        color: "red",
        icon: <IconAlertCircle />,
      });
    }
  };

  const handleDeclineInvitation = async (invitationId: string) => {
    try {
      const response = await fetch("/api/invitation/decline", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invitationId,
        }),
      });

      if (response.status === 200) {
        notifications.show({
          title: "Invitation declined",
          message: "You have successfully declined the invitation.",
          color: "teal",
          icon: <IconCheck />,
        });

        // Update the invitations state
        setShowingInvitations((prevInvitations) =>
          prevInvitations.filter((invitation) => invitation.id !== invitationId)
        );
      }
    } catch (error) {
      console.error(error);
      notifications.show({
        title: "Error",
        message: "An error occurred while accepting the invitation.",
        color: "red",
        icon: <IconAlertCircle />,
      });
    }
  };

  return { handleAcceptInvitation, handleDeclineInvitation };
};

export default useTeamInvitation;
