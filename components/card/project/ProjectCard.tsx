import OptionsMenu from "@/components/menu/OptionsMenu";
import { Button, Card, Group, Stack, Text, Tooltip } from "@mantine/core";
import { Project } from "@prisma/client";
import {
  IconEdit,
  IconNote,
  IconTags,
  IconTrash,
  IconVideo,
} from "@tabler/icons-react";
import Link from "next/link";
import { FC, memo, useMemo } from "react";

export interface IProjectCard {
  project: Project;
  fileCount: number;
  noteCount: number;
  tagCount: number;
}

const ProjectCard: FC<IProjectCard> = ({
  project,
  fileCount,
  noteCount,
  tagCount,
}) => {
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
      <Stack justify="space-between" align="stretch" h="100%" spacing={"xl"}>
        <Stack spacing={"xs"} justify="space-between" align="stretch">
          <Group noWrap position="apart">
            <Text fz="lg" fw={500}>
              {project.name}
            </Text>
            <OptionsMenu options={menuOptions} />
          </Group>
          <Text fz="sm" c={"dimmed"} lineClamp={2}>
            {project.description}
          </Text>
        </Stack>
        <Group position="apart">
          <Group spacing={"sm"}>
            <Tooltip
              withinPortal
              label={`This project has ${fileCount || "no"} ${
                fileCount !== 0 && fileCount <= 1 ? "file" : "files"
              }`}
            >
              <Group spacing={"0.25rem"} position="left">
                <IconVideo size={"1rem"} />
                <Text>{fileCount || 0}</Text>
              </Group>
            </Tooltip>

            <Tooltip
              withinPortal
              label={`This project has ${noteCount || "no"} ${
                noteCount !== 0 && noteCount <= 1 ? "note" : "notes"
              }`}
            >
              <Group spacing={"0.25rem"} position="left">
                <IconNote size={"1rem"} />
                <Text>{noteCount || 0}</Text>
              </Group>
            </Tooltip>

            <Tooltip
              withinPortal
              label={`This project has ${tagCount || "no"} ${
                tagCount !== 0 && tagCount <= 1 ? "tag" : "tags"
              }`}
            >
              <Group spacing={"0.25rem"} position="left">
                <IconTags size={"1rem"} />
                <Text>{tagCount || 0}</Text>
              </Group>
            </Tooltip>
          </Group>
          <Link
            href={`/teams/${project.teamId}/projects/${project.id}/files`}
            passHref
          >
            <Button variant="default">View</Button>
          </Link>
        </Group>
      </Stack>
    </Card>
  );
};

export default memo(ProjectCard);
