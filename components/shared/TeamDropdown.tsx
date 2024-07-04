import useTeams from "@/hooks/useTeams";
import {
  Group,
  Menu,
  Text,
  UnstyledButton,
  useMantineTheme,
} from "@mantine/core";
import {
  IconFolder,
  IconLogout,
  IconSelector,
  IconUserCircle,
} from "@tabler/icons-react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";

export const TeamDropdown = () => {
  const router = useRouter();
  const { teams } = useTeams();
  const { data } = useSession();
  const theme = useMantineTheme();

  const currentTeam = (teams || []).find(
    (team) => team.id === router.query.teamId
  );

  return (
    <Menu width={"90%"}>
      <Menu.Target>
        <UnstyledButton
          style={(theme) => ({
            display: "block",
            width: "100%",
            padding: `${theme.spacing.sm} ${theme.spacing.md}`,
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
              {currentTeam?.name || data?.user?.name || "Select team"}
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
              icon={<IconFolder size="1.1rem" />}
              onClick={() => router.push(`/teams/${team.id}/projects`)}
            >
              {team.name}
            </Menu.Item>
          ))
        ) : (
          <Menu.Item disabled icon={<IconFolder size="1.1rem" />}>
            No teams
          </Menu.Item>
        )}

        <Menu.Divider />

        <Menu.Label>Profile</Menu.Label>
        <Menu.Item
          icon={<IconUserCircle size="1.1rem" />}
          onClick={() => router.push("/profile")}
        >
          {data?.user?.name}
        </Menu.Item>
        <Menu.Item
          onClick={() => {
            signOut({ callbackUrl: "/" });
          }}
          icon={<IconLogout size="1.1rem" />}
          color={colorScheme === "dark" ? theme.white : theme.black}
        >
          Log out
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
