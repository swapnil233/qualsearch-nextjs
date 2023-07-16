import { Button, Card, Stack, Text } from "@mantine/core";
import { Project } from "@prisma/client";
import Link from "next/link";
import { FC, memo } from "react";

export interface IProjectCard {
  project: Project;
}

const ProjectCard: FC<IProjectCard> = ({ project }) => {
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
            {project.name}
          </Text>
          <Text fz="sm" c={"dimmed"} lineClamp={2}>
            {project.description}
          </Text>
        </Stack>

        <Link href={`/teams/${project.teamId}/projects/${project.id}`} passHref>
          <Button variant="default">View</Button>
        </Link>
      </Stack>
    </Card>
  );
};

export default memo(ProjectCard);
