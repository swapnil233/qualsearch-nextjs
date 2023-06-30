import { TeamWithUsers } from "@/types";
import { Avatar, Card, Group, Text, Tooltip } from "@mantine/core";
import Link from "next/link";
import { FC } from "react";

export interface ITeamCard {
  team: TeamWithUsers;
}

const TeamCard: FC<ITeamCard> = ({ team }) => {
  return (
    <Card withBorder padding="lg" radius="md">
      <Text fz="lg" fw={500}>
        <Link href={`/teams/${team.id}`}>{team.name}</Link>
      </Text>
      <Text fz="sm" c="dimmed" mt={5} lineClamp={3}>
        {team.description}
      </Text>

      <Group position="apart" mt="md">
        <Avatar.Group spacing="sm">
          {team.users.slice(0, 3).map((user, index) => (
            <Tooltip
              key={index}
              label={`${user.name}, ${user.email}`}
              position="top"
              withArrow
            >
              <Avatar key={index} src={user.image} radius="xl" />
            </Tooltip>
          ))}
          {team.users.length > 3 && (
            <Tooltip
              label={`${team.users.length - 3} more users`}
              position="top"
              withArrow
            >
              <Avatar radius="xl">+{team.users.length - 3}</Avatar>
            </Tooltip>
          )}
        </Avatar.Group>
      </Group>
    </Card>
  );
};

export default TeamCard;
