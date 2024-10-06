import { NoteWithTagsAndCreator } from "@/types";
import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Group,
  HoverCard,
  Menu,
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
  mediaRef: React.MutableRefObject<HTMLAudioElement | HTMLVideoElement | null>;
}

export function NoteCard({ position, note, mediaRef }: INoteCardProps) {
  const [noteIsPlaying, setNoteIsPlaying] = useState<boolean>(false);

  const router = useRouter();
  const projectId = router.query.projectId as string;
  const teamId = router.query.teamId as string;

  const handlePlayNote = () => {
    if (mediaRef.current) {
      const playAudioAfterSeek = () => {
        mediaRef.current?.play().catch((error) => {
          console.error("Audio playback error:", error);
        });
        setNoteIsPlaying(true);
        mediaRef.current?.removeEventListener("seeked", playAudioAfterSeek);
      };

      mediaRef.current.addEventListener("seeked", playAudioAfterSeek);

      mediaRef.current.currentTime = note.start;
    }
  };

  const handleStopNote = () => {
    if (mediaRef.current) {
      mediaRef.current.pause();
      setNoteIsPlaying(false);
    }
  };

  useEffect(() => {
    const stopAtNoteEnd = () => {
      if (mediaRef.current && mediaRef.current.currentTime >= note.end) {
        mediaRef.current.pause();
        mediaRef.current.removeEventListener("timeupdate", stopAtNoteEnd);
        setNoteIsPlaying(false);
      }
    };

    const currentAudio = mediaRef.current;

    if (mediaRef.current) {
      mediaRef.current.addEventListener("timeupdate", stopAtNoteEnd);
    }

    return () => {
      if (currentAudio) {
        currentAudio.removeEventListener("timeupdate", stopAtNoteEnd);
      }
    };
  }, [mediaRef, note.end]);

  return (
    <Box
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
      }}
    >
      <Group align="center" gap={"sm"}>
        <HoverCard width={300} position="bottom" withArrow shadow="md">
          <HoverCard.Target>
            <ActionIcon radius="xl" variant="default">
              <IconMessage size={16} />
            </ActionIcon>
          </HoverCard.Target>

          <HoverCard.Dropdown>
            <Stack align="flex-start" gap={"xl"}>
              <Stack gap={"sm"} w={"100%"}>
                <Stack justify="space-between" align="center" w={"100%"}>
                  <Group justify="space-between" w={"100%"}>
                    <Group>
                      <Avatar
                        src={note.createdBy?.image || "anonUser.png"}
                        alt={note.createdBy?.name || "Anonymous User"}
                        radius="xl"
                      />
                      <Stack gap={0}>
                        <Text fz="md">{note.createdBy?.name}</Text>
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
                        <Menu.Item leftSection={<IconEdit size={14} />}>
                          Edit
                        </Menu.Item>
                        <Menu.Item
                          color="red"
                          leftSection={<IconTrash size={14} />}
                        >
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
          </HoverCard.Dropdown>
        </HoverCard>
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
