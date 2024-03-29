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

      <td>2 days ago</td>

      <td>
        <Group spacing={0} position="right">
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
                  <Menu.Item icon={<IconMessages size="1rem" stroke={1.5} />}>
                    Send message
                  </Menu.Item>
                  <Menu.Item icon={<IconNote size="1rem" stroke={1.5} />}>
                    Add note
                  </Menu.Item>
                  <Menu.Item
                    icon={<IconReportAnalytics size="1rem" stroke={1.5} />}
                  >
                    Analytics
                  </Menu.Item>
                </>
              ) : (
                <Menu.Item
                  icon={<IconTrash size="1rem" stroke={1.5} />}
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
