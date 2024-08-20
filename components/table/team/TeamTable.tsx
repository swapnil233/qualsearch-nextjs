import {
  ActionIcon,
  Avatar,
  Group,
  Menu,
  ScrollArea,
  Table,
  Text,
} from "@mantine/core";
import { User } from "@prisma/client";
import {
  IconDots,
  IconMessages,
  IconNote,
  IconReportAnalytics,
  IconTrash,
} from "@tabler/icons-react";
import { FC } from "react";

export interface ITeamTable {
  currentUser: User;
  teamMembers: User[];
}

const TeamTable: FC<ITeamTable> = ({ currentUser, teamMembers }) => {
  const rows = teamMembers.map((member) => (
    <tr key={member.id}>
      <td>
        <Group gap="sm">
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

      <td>2 days ago</td>

      <td>
        <Group gap={0} align="right">
          <Menu
            transitionProps={{ transition: "pop" }}
            withArrow
            position="bottom-end"
            withinPortal
          >
            <Menu.Target>
              <ActionIcon>
                <IconDots size="1rem" stroke={1.5} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              {currentUser.id !== member.id ? (
                <>
                  <Menu.Item
                    leftSection={<IconMessages size="1rem" stroke={1.5} />}
                  >
                    Send message
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconNote size="1rem" stroke={1.5} />}
                  >
                    Add note
                  </Menu.Item>
                  <Menu.Item
                    leftSection={
                      <IconReportAnalytics size="1rem" stroke={1.5} />
                    }
                  >
                    Analytics
                  </Menu.Item>
                </>
              ) : (
                <Menu.Item
                  leftSection={<IconTrash size="1rem" stroke={1.5} />}
                  color="red"
                >
                  Leave team
                </Menu.Item>
              )}
            </Menu.Dropdown>
          </Menu>
        </Group>
      </td>
    </tr>
  ));

  return (
    <ScrollArea>
      <Table miw={800} verticalSpacing="sm">
        <thead>
          <tr>
            <th>Member</th>
            <th>Last active</th>
            <th align="right">Actions</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </ScrollArea>
  );
};

export default TeamTable;
