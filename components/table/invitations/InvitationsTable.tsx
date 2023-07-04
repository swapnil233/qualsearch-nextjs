import { Button, Group, ScrollArea, Table, Text } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { FC } from "react";

/**
 * This component will be used in /teams to show the invitations a user has to join other teams.
 * Team name
 * Team description (trunc)
 * Date the invitation was recieved
 * Actions: accept, decline
 */

export interface IInvitationsTable {
  invitations: IInvitationData[];
}

export interface IInvitationData {
  id: string;
  teamName: string;
  teamDescription: string | null;
  createdAt: string;
}

const InvitationsTable: FC<IInvitationsTable> = ({ invitations }) => {
  const rows = invitations.map((invitation) => (
    <tr key={invitation.id}>
      {/* Team name */}
      <td>
        <Text size="sm">{invitation.teamName}</Text>
      </td>

      {/* Description */}
      <td>
        <Text size="sm">
          {invitation.teamDescription !== null &&
          invitation.teamDescription !== "" ? (
            <>{invitation.teamDescription}</>
          ) : (
            <>
              <Text italic size="sm">
                -
              </Text>
            </>
          )}
        </Text>
      </td>

      {/* Recieved */}
      <td>
        <Text size="sm">{invitation.createdAt}</Text>
      </td>

      {/* Actions */}
      <td>
        <Group spacing={"xs"}>
          <Button
            leftIcon={<IconCheck size={"1.2rem"} />}
            variant="light"
            color="green"
          >
            Accept
          </Button>
          <Button variant="subtle" color="red">
            Decline
          </Button>
        </Group>
      </td>
    </tr>
  ));

  return (
    <ScrollArea>
      <Table miw={800} verticalSpacing="sm">
        <thead>
          <tr>
            <th>Team name</th>
            <th>Description</th>
            <th>Recieved</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </ScrollArea>
  );
};

export default InvitationsTable;
