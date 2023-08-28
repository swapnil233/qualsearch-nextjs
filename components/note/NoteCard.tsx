import { NotesAndUsers } from "@/types";
import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Group,
  Menu,
  Popover,
  Stack,
  Text,
  useMantineTheme,
} from "@mantine/core";
import {
  IconDots,
  IconEdit,
  IconPlayerPlayFilled,
  IconTrash,
} from "@tabler/icons-react";
import { useState } from "react";

interface INoteCardProps {
  position: {
    top: number;
    left: number;
  };
  note: NotesAndUsers;
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
}

export function NoteCard({ position, note, audioRef }: INoteCardProps) {
  const [noteIsPlaying, setNoteIsPlaying] = useState<boolean>(false);
  const theme = useMantineTheme();

  const handlePlayNote = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = note.start;
      audioRef.current.play();
      setNoteIsPlaying(true);

      // Stop playing when the note's end time is reached
      const stopAtNoteEnd = () => {
        if (audioRef.current && audioRef.current.currentTime >= note.end) {
          audioRef.current.pause();
          setNoteIsPlaying(false);
          audioRef.current.removeEventListener("timeupdate", stopAtNoteEnd);
        }
      };

      audioRef.current.addEventListener("timeupdate", stopAtNoteEnd);
    }
  };

  const handlePauseNote = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setNoteIsPlaying(false);
    }
  };

  return (
    <Box
      w={264}
      sx={{
        position: "absolute",
        top: position.top,
        left: position.left,
      }}
    >
      <Group align="center" spacing={"sm"}>
        <Popover width={300} position="bottom" withArrow shadow="md">
          <Popover.Target>
            <ActionIcon color="orange.1" radius="xl" variant="filled">
              {/* <IconMessage color={theme.colors.orange[9]} size="1.125rem" /> */}
              <Avatar
                src={note.createdBy.image}
                alt={note.createdBy.name || ""}
                radius="xl"
                size={"sm"}
              />
            </ActionIcon>
          </Popover.Target>

          <Popover.Dropdown>
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
          </Popover.Dropdown>
        </Popover>
        <Button
          variant="filled"
          compact
          leftIcon={<IconPlayerPlayFilled size={"0.8rem"} />}
          onClick={noteIsPlaying ? handlePauseNote : handlePlayNote}
        >
          {noteIsPlaying ? "Pause" : "Play note"}
        </Button>
      </Group>
    </Box>
  );
}
