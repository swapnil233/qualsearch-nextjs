import useTeams from "@/hooks/useTeams";
import {
  Group,
  Menu,
  Text,
  UnstyledButton,
  useMantineColorScheme,
} from "@mantine/core";
import { IconFolder, IconSelector } from "@tabler/icons-react";
import { useRouter } from "next/router";

export const TeamDropdown = () => {
  const router = useRouter();
  const { teams } = useTeams();

  const currentTeam = (teams || []).find(
    (team) => team.id === router.query.teamId
  );
  const { colorScheme } = useMantineColorScheme();

  return (
    <Menu>
      <Menu.Target>
        <UnstyledButton
          p="md"
          w="100%"
          style={(theme) => ({
            borderRadius: theme.radius.sm,
            border: `1px solid ${
              colorScheme === "dark"
                ? theme.colors.dark[3]
                : theme.colors.gray[3]
            }`,
            color: colorScheme === "dark" ? theme.colors.dark[0] : theme.black,

            "&:hover": {
              backgroundColor:
                colorScheme === "dark"
                  ? theme.colors.dark[8]
                  : theme.colors.gray[0],
            },
          })}
        >
          <Group justify="space-between">
            <Text size="sm" fw={700}>
              {currentTeam?.name || "Select a team"}
            </Text>

            {<IconSelector size="1.1rem" />}
          </Group>
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Teams</Menu.Label>
        {teams?.length !== 0 ? (
          (teams || []).map((team) => (
            <Menu.Item
              key={team.id}
              leftSection={<IconFolder size="1.1rem" />}
              onClick={() => router.push(`/teams/${team.id}/projects`)}
            >
              {team.name}
            </Menu.Item>
          ))
        ) : (
          <Menu.Item disabled leftSection={<IconFolder size="1.1rem" />}>
            No teams
          </Menu.Item>
        )}
      </Menu.Dropdown>
    </Menu>
  );
};
