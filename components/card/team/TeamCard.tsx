import OptionsMenu from "@/components/menu/OptionsMenu";
import { TeamWithUsers } from "@/types";
import {
  Avatar,
  Button,
  Card,
  Group,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import Link from "next/link";
import { FC, memo, useMemo } from "react";

export interface ITeamCard {
  team: TeamWithUsers;
}

const TeamCard: FC<ITeamCard> = ({ team }) => {
  const menuOptions = useMemo(
    () => [
      {
        option: "Edit",
        icon: <IconEdit size={"1rem"} />,
        onClick: () => {},
      },
      {
        option: "Delete",
        color: "red",
        icon: <IconTrash size={"1rem"} />,
        onClick: () => {},
      },
    ],
    []
  );

  return (
    <Card
      withBorder
      radius="sm"
      sx={(theme) => ({
        backgroundColor:
          theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.white,
      })}
    >
      <Stack justify="space-between" align="stretch" h="100%">
        <Stack spacing={"xs"} justify="space-between" align="stretch">
          <Group noWrap position="apart">
            <Text fz="lg" fw={500}>
              {team.name}
            </Text>
            <OptionsMenu options={menuOptions} />
          </Group>
          <Text fz="sm" c={"dimmed"} lineClamp={3}>
            {team.description}
          </Text>
        </Stack>

        <Group position="apart">
          <Avatar.Group spacing="sm">
            {team.users.slice(0, 3).map((user) => (
              <Tooltip
                key={user.id}
                label={`${user.name}, ${user.email}`}
                position="top"
                withArrow
                withinPortal
              >
                <Avatar src={user.image} radius="xl" variant="filled" />
              </Tooltip>
            ))}
            {team.users.length > 3 && (
              <Tooltip
                label={
                  team.users.length - 3 > 1
                    ? `${team.users.length - 3} more users`
                    : `${team.users.length - 3} more user`
                }
                position="top"
                withArrow
              >
                <Avatar radius="xl">
                  <Text fz={"sm"} fw={"bold"}>
                    +{team.users.length - 3}
                  </Text>
                </Avatar>
              </Tooltip>
            )}
          </Avatar.Group>
          <Link href={`/teams/${team.id}`} passHref>
            <Button variant="default">View</Button>
          </Link>
        </Group>
      </Stack>
    </Card>
  );
};

export default memo(TeamCard);
