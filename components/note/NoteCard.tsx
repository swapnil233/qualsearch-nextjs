import { NotesAndUsers } from "@/types";
import {
  ActionIcon,
  Avatar,
  Box,
  Group,
  Menu,
  Paper,
  Stack,
  Text,
} from "@mantine/core";
import { IconDots, IconEdit, IconTrash } from "@tabler/icons-react";

interface INoteCardProps {
  position: {
    top: number;
    left: number;
  };
  note: NotesAndUsers;
}

export function NoteCard({ position, note }: INoteCardProps) {
  return (
    <Box
      w={264}
      sx={{
        position: "absolute",
        top: position.top,
        left: position.left,
      }}
    >
      <Paper
        withBorder
        radius="md"
        p="sm"
        top={position.top}
        left={position.left}
      >
        <Stack align="flex-start">
          <Stack justify="flex-start" align="flex-start" w={"100%"}>
            <Group position="apart" w={"100%"}>
              <Group>
                <Avatar
                  src={note.createdBy.image}
                  alt={note.createdBy.name || ""}
                  radius="xl"
                />
                <Stack spacing={0}>
                  <Text fz="md">{note.createdBy.name}</Text>
                  <Text fz="xs" c="dimmed">
                    {new Date(note.createdAt).toDateString()}
                  </Text>
                </Stack>
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
          </Stack>
          <Stack justify="flex-start">
            <Text fz={"sm"}>{note.text}</Text>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
