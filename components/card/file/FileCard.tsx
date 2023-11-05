import { FileWithoutTranscriptAndUri } from "@/types";
import {
  ActionIcon,
  Button,
  Card,
  Group,
  Loader,
  Menu,
  Stack,
  Text,
} from "@mantine/core";
import { useHover } from "@mantine/hooks";
import {
  IconBuilding,
  IconCalendar,
  IconDots,
  IconEdit,
  IconTrash,
  IconUser,
} from "@tabler/icons-react";
import { useRouter } from "next/router";
import { FC, memo } from "react";

export interface IFileCard {
  file: FileWithoutTranscriptAndUri;
  teamId: string;
}

const FileCard: FC<IFileCard> = ({ file, teamId }) => {
  const router = useRouter();
  const { hovered, ref } = useHover();

  return (
    <Card
      ref={ref}
      withBorder
      {...(hovered && { shadow: "xs" })}
      radius="sm"
      sx={(theme) => ({
        backgroundColor:
          theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.white,
        transition: "all 0.1s ease",
      })}
    >
      <Stack justify="space-between" align="stretch" h="100%" spacing={"xl"}>
        <Stack spacing={"xs"} justify="space-between" align="stretch">
          <Group noWrap position="apart">
            <Group spacing={"xs"}>
              {file.status === "PROCESSING" && <Loader size={"xs"} />}
              <Text fz="lg" fw={500}>
                {file.name}
              </Text>
            </Group>
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <ActionIcon variant="transparent">
                  <IconDots size="1rem" />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item icon={<IconEdit size={14} />}>Edit</Menu.Item>
                <Menu.Item color="red" icon={<IconTrash size={14} />}>
                  Delete
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
          <Text fz="sm" c={"dimmed"} lineClamp={2}>
            {file.description}
          </Text>
        </Stack>

        <Group position="apart" noWrap>
          <Group>
            {file.participantName && (
              <Group spacing={4} noWrap>
                <IconUser size={"1.1rem"} color="gray" />
                <Text fz="sm" c={"dimmed"} truncate lineClamp={1} maw={"100%"}>
                  {file.participantName.trim()}
                </Text>
              </Group>
            )}

            {file.participantOrganization && (
              <Group spacing={4} noWrap>
                <IconBuilding size={"1.1rem"} color="gray" />
                <Text fz="sm" c={"dimmed"} truncate lineClamp={1} maw={"100%"}>
                  {file.participantOrganization.trim()}
                </Text>
              </Group>
            )}

            {file.dateConducted && (
              <Group spacing={4} noWrap>
                <IconCalendar size={"1.1rem"} color="gray" />
                <Text fz="sm" c={"dimmed"} truncate lineClamp={1} maw={"100%"}>
                  {new Date(file.dateConducted).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                </Text>
              </Group>
            )}
          </Group>
          <Button
            disabled={file.status === "PROCESSING"}
            variant="default"
            onClick={() => {
              file.status === "COMPLETED"
                ? router.push(
                    `/teams/${teamId}/projects/${file.projectId}/files/${file.id}`
                  )
                : "";
            }}
          >
            {file.status === "PROCESSING" ? "Transcribing" : "View"}
          </Button>
        </Group>
      </Stack>
    </Card>
  );
};

export default memo(FileCard);
