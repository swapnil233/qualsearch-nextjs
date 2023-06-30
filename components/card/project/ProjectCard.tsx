import { Card, Text } from "@mantine/core";
import { Project } from "@prisma/client";
import Link from "next/link";
import { FC } from "react";

export interface IProjectCard {
  project: Project;
}

const ProjectCard: FC<IProjectCard> = ({ project }) => {
  return (
    <Card withBorder padding="lg" radius="md">
      <Text fz="lg" fw={500}>
        <Link href={`/teams/${project.teamId}/projects/${project.id}`}>
          {project.name}
        </Link>
      </Text>
      <Text fz="sm" c="dimmed" mt={5} lineClamp={3}>
        {project.description}
      </Text>
    </Card>
  );
};

export default ProjectCard;
