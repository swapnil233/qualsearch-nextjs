import { NotesAndUsers } from "@/types";
import { Avatar, Box, Group, Paper, Stack, Text } from "@mantine/core";

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
        zIndex: 10,
      }}
    >
      <Paper
        withBorder
        radius="md"
        p="sm"
        top={position.top}
        left={position.left}
      >
        <Group align="flex-start">
          <Stack justify="flex-start" align="flex-start">
            <Avatar
              src={note.createdBy.image}
              alt={note.createdBy.name || ""}
              radius="xl"
            />
          </Stack>
          <Stack justify="flex-start">
            <Stack spacing={0}>
              <Text fz="md">{note.createdBy.name}</Text>
              <Text fz="xs" c="dimmed">
                {new Date(note.createdAt).toDateString()}
              </Text>
            </Stack>
            <Text fz={"sm"}>{note.text}</Text>
          </Stack>
        </Group>
      </Paper>
    </Box>
  );
}
