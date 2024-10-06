import { Button, Group, ScrollArea, Table, Text } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { FC } from "react";

/**
 * This component will be used in /teams to show the invitations a user has to join other teams.
 * Team name
 * Team description (trunc)
 * Date the invitation was received
 * Actions: accept, decline
 */

export interface IInvitationsTable {
  invitations: IInvitationData[];
  handleAcceptInvitation: (_id: string) => void;
  handleDeclineInvitation: (_id: string) => void;
}

export interface IInvitationData {
  id: string;
  teamName: string;
  teamDescription: string | null;
  createdAt: string;
}

const InvitationsTable: FC<IInvitationsTable> = ({
  invitations,
  handleAcceptInvitation,
  handleDeclineInvitation,
}) => {
  const rows = invitations.map((invitation) => (
    <tr key={invitation.id}>
      {/* Team name */}
      <td className="py-4">
        <Text size="sm" fw={500}>
          {invitation.teamName}
        </Text>
      </td>

      {/* Description */}
      <td className="py-4">
        <Text size="sm">
          {invitation.teamDescription !== null &&
          invitation.teamDescription !== "" ? (
            <>{invitation.teamDescription}</>
          ) : (
            <Text fs="italic" size="sm">
              -
            </Text>
          )}
        </Text>
      </td>

      {/* Received */}
      <td className="py-4">{invitation.createdAt}</td>

      {/* Actions */}
      <td className="py-4" style={{ textAlign: "right" }}>
        <Group gap="xs" p="right">
          <Button
            leftSection={<IconCheck size={"1.2rem"} />}
            variant="light"
            color="green"
            onClick={() => handleAcceptInvitation(invitation.id)}
          >
            Accept
          </Button>
          <Button
            variant="subtle"
            color="red"
            onClick={() => handleDeclineInvitation(invitation.id)}
          >
            Decline
          </Button>
        </Group>
      </td>
    </tr>
  ));

  return (
    <ScrollArea>
      <Table miw={800}>
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>Team name</th>
            <th style={{ textAlign: "left" }}>Description</th>
            <th style={{ textAlign: "left" }}>Received</th>
            <th style={{ textAlign: "left" }}>Actions</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </ScrollArea>
  );
};

export default InvitationsTable;
