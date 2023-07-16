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
import { User } from "@prisma/client";
import Link from "next/link";
import { FC, memo } from "react";

export interface ITeamCard {
  team: TeamWithUsers;
}

interface UserAvatarProps {
  user: User;
}

const UserAvatar: FC<UserAvatarProps> = ({ user }) => (
  <Tooltip label={`${user.name}, ${user.email}`} position="top" withArrow>
    <Avatar src={user.image} radius="xl" variant="filled" />
  </Tooltip>
);

const TeamCard: FC<ITeamCard> = ({ team }) => {
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
          <Text fz="lg" fw={500}>
            {team.name}
          </Text>
          <Text fz="sm" c={"dimmed"} lineClamp={3}>
            {team.description}
          </Text>
        </Stack>

        <Group position="apart">
          <Avatar.Group spacing="sm">
            {team.users.slice(0, 3).map((user) => (
              <UserAvatar key={user.id} user={user} />
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
