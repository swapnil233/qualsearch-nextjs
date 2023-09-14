import { NoteWithTagsAndCreator } from "@/types";
import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
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
  IconMessage,
  IconPlayerPlayFilled,
  IconPlayerStopFilled,
  IconTrash,
} from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

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

  const router = useRouter();
  const projectId = router.query.projectId as string;
  const teamId = router.query.teamId as string;

  const handlePlayNote = () => {
    if (audioRef.current) {
      const playAudioAfterSeek = () => {
        audioRef.current?.play().catch((error) => {
          console.error("Audio playback error:", error);
        });
        setNoteIsPlaying(true);
        audioRef.current?.removeEventListener("seeked", playAudioAfterSeek);
      };

      audioRef.current.addEventListener("seeked", playAudioAfterSeek);

      audioRef.current.currentTime = note.start;
    }
  };

  const handleStopNote = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setNoteIsPlaying(false);
    }
  };

  useEffect(() => {
    const stopAtNoteEnd = () => {
      if (audioRef.current && audioRef.current.currentTime >= note.end) {
        audioRef.current.pause();
        audioRef.current.removeEventListener("timeupdate", stopAtNoteEnd);
        setNoteIsPlaying(false);
      }
    };

    if (audioRef.current) {
      audioRef.current.addEventListener("timeupdate", stopAtNoteEnd);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("timeupdate", stopAtNoteEnd);
      }
    };
  }, [audioRef, note.end]);

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
            <ActionIcon radius="xl" variant="default">
              <IconMessage size={16} />
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
                {note.tags.map((tag) => {
                  return (
                    <Link
                      href={`/teams/${teamId}/projects/${projectId}/tags/${tag.id}`}
                      key={tag.id}
                      style={{ textDecoration: "none" }}
                    >
                      <Tooltip label={tag.name}>
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
                    </Link>
                  );
                })}
              </SimpleGrid>
            </Stack>
          </Popover.Dropdown>
        </Popover>
        <ActionIcon color="blue" radius="xl" variant="filled">
          {noteIsPlaying ? (
            <IconPlayerStopFilled
              color="blue"
              size={16}
              onClick={handleStopNote}
            />
          ) : (
            <IconPlayerPlayFilled
              color="blue"
              size={16}
              onClick={handlePlayNote}
            />
          )}
        </ActionIcon>
      </Group>
    </Box>
  );
}
