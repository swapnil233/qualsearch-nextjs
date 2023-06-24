import { TeamWithUsers } from "@/types";
import { Avatar, Card, Group, Text } from "@mantine/core";
import Link from "next/link";

interface TeamCardProps {
  team: TeamWithUsers;
}

const TeamCard: React.FC<TeamCardProps> = ({ team }) => {
  return (
    <Card withBorder padding="lg" radius="md">
      <Text fz="lg" fw={500} mt="md">
        <Link href={`/teams/${team.id}`}>{team.name}</Link>
      </Text>
      <Text fz="sm" c="dimmed" mt={5}>
        {team.description}
      </Text>

      <Group position="apart" mt="md">
        <Avatar.Group spacing="sm">
          {team.users.slice(0, 3).map((user, index) => (
            <Avatar key={index} src={user.image} radius="xl" />
          ))}
          {team.users.length > 3 && (
            <Avatar radius="xl">+{team.users.length - 3}</Avatar>
          )}
        </Avatar.Group>
      </Group>
    </Card>
  );
};

export default TeamCard;
