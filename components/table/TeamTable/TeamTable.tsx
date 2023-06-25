import { Avatar, Group, ScrollArea, Select, Table, Text } from "@mantine/core";
import { User } from "@prisma/client";
import { FC } from "react";

export interface ITeamTable {
  teamMembers: User[];
  handleRoleChange: (userId: string, role: string) => void;
}

const rolesData = ["Manager", "Collaborator", "Contractor"];

const TeamTable: FC<ITeamTable> = ({ teamMembers, handleRoleChange }) => {
  const rows = teamMembers.map((member) => (
    <tr key={member.id}>
      <td>
        <Group spacing="sm">
          <Avatar size={40} src={member.image} radius={40} />
          <div>
            <Text fz="sm" fw={500}>
              {member.name}
            </Text>
            <Text fz="xs" c="dimmed">
              {member.email}
            </Text>
          </div>
        </Group>
      </td>

      <td>
        <Select
          data={rolesData}
          defaultValue={member.role}
          variant={"unstyled"}
          onChange={(role) => {
            role && handleRoleChange(member.id, role);
          }}
        />
      </td>
      <td>2 days ago</td>
    </tr>
  ));

  return (
    <ScrollArea>
      <Table miw={800} verticalSpacing="sm">
        <thead>
          <tr>
            <th>Member</th>
            <th>Role</th>
            <th>Last active</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </ScrollArea>
  );
};

export default TeamTable;
