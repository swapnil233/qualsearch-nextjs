import { NoteWithTagsAndCreator } from "@/types";
import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Group,
  Menu,
  Popover,
  SimpleGrid,
  Stack,
  Text,
  Tooltip,
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
  note: NoteWithTagsAndCreator;
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
}

export function NoteCard({ position, note, audioRef }: INoteCardProps) {
  const [noteIsPlaying, setNoteIsPlaying] = useState<boolean>(false);

  const handlePlayNote = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = note.start;
      audioRef.current.play();
      setNoteIsPlaying(true);

      // Stop playing when the note's end time is reached
      const stopAtNoteEnd = () => {
        if (audioRef.current && audioRef.current.currentTime >= note.end) {
          audioRef.current.pause();
          audioRef.current.removeEventListener("timeupdate", stopAtNoteEnd);
          setNoteIsPlaying(false);
        }
      };

      audioRef.current.addEventListener("timeupdate", stopAtNoteEnd);
    }
  };

  return (
    <Box
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
            <Stack align="flex-start" spacing={"xl"}>
              <Stack spacing={"sm"} w={"100%"}>
                <Stack justify="space-between" align="center" w={"100%"}>
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
                        <Menu.Item icon={<IconEdit size={14} />}>
                          Edit
                        </Menu.Item>
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
              <SimpleGrid
                w={"100%"}
                cols={2}
                spacing={"xs"}
                verticalSpacing={"xs"}
              >
                {note.tags.map((tag, index) => {
                  return (
                    <Tooltip key={index} label={tag.name}>
                      <Badge
                        fullWidth
                        radius="xs"
                        variant="filled"
                        size="sm"
                        color="red"
                      >
                        {tag.name}
                      </Badge>
                    </Tooltip>
                  );
                })}
              </SimpleGrid>
            </Stack>
          </Popover.Dropdown>
        </Popover>
        {note.tags.length > 0 && (
          <Badge radius={"xs"} size="lg">
            {note.tags.length > 1
              ? `${note.tags.length} tags`
              : `${note.tags.length} tag`}
          </Badge>
        )}
        <Button
          variant="filled"
          compact
          leftIcon={<IconPlayerPlayFilled size={"0.8rem"} />}
          onClick={handlePlayNote}
          disabled={noteIsPlaying}
        >
          {noteIsPlaying ? "Playing..." : "Play"}
        </Button>
      </Group>
    </Box>
  );
}
