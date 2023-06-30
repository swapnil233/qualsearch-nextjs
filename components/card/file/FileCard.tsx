import { Card, Text } from "@mantine/core";
import { File } from "@prisma/client";
import Link from "next/link";
import { FC } from "react";

export interface IFileCard {
  file: File;
  teamId: string;
}

const FileCard: FC<IFileCard> = ({ file, teamId }) => {
  return (
    <Card withBorder padding="lg" radius="md">
      <Text fz="lg" fw={500}>
        <Link
          href={`/teams/${teamId}/projects/${file.projectId}/files/${file.id}`}
        >
          {file.name}
        </Link>
      </Text>
      <Text fz="sm" c="dimmed" mt={5} lineClamp={3}>
        {file.description}
      </Text>
    </Card>
  );
};

export default FileCard;
