import { NoteWithTagsAndCreator } from "@/types";
import { calculateNoteCardPosition } from "@/utils/calculateNoteCardPosition";
import {
  ActionIcon,
  Aside,
  Avatar,
  Box,
  Button,
  Card,
  Center,
  Group,
  Menu,
  ScrollArea,
  SegmentedControl,
  Stack,
  Text,
  useMantineTheme,
} from "@mantine/core";
import {
  IconDots,
  IconEdit,
  IconListSearch,
  IconNote,
  IconPlayerPlay,
  IconSparkles,
  IconTags,
  IconTrash,
} from "@tabler/icons-react";
import React from "react";
import EmptyState from "../states/empty/EmptyState";

interface ITranscriptPageAside {
  segment: "tags" | "notes" | "chat";
  setSegment: React.Dispatch<React.SetStateAction<"tags" | "notes" | "chat">>;
  notes: NoteWithTagsAndCreator[];
  mediaRef: React.MutableRefObject<HTMLAudioElement | HTMLVideoElement | null>;
  transcriptContainerDivRef: React.RefObject<HTMLDivElement>;
}

export const TranscriptPageAside: React.FC<ITranscriptPageAside> = ({
  segment,
  setSegment,
  notes,
  mediaRef,
  transcriptContainerDivRef,
}) => {
  const theme = useMantineTheme();

  const handlePlayClicked = (note: NoteWithTagsAndCreator) => {
    const notePosition = calculateNoteCardPosition(
      note.start,
      note.end,
      transcriptContainerDivRef
    );

    // Scroll to note
    window.scrollTo({
      top: notePosition ? notePosition.top - 100 : 0,
      behavior: "smooth",
    });

    if (mediaRef.current) {
      mediaRef.current.currentTime = note.start;
      mediaRef.current.play();

      // Stop playing when the note's end time is reached
      const stopAtNoteEnd = () => {
        if (mediaRef.current && mediaRef.current.currentTime >= note.end) {
          mediaRef.current.pause();
          mediaRef.current.removeEventListener("timeupdate", stopAtNoteEnd);
        }
      };

      mediaRef.current.addEventListener("timeupdate", stopAtNoteEnd);
    }
  };

  const handleFindClicked = (note: NoteWithTagsAndCreator) => {
    const notePosition = calculateNoteCardPosition(
      note.start,
      note.end,
      transcriptContainerDivRef
    );

    // Scroll to note
    window.scrollTo({
      top: notePosition ? notePosition.top - 100 : 0,
      behavior: "smooth",
    });
  };

  return (
    <Aside
      p="md"
      hiddenBreakpoint="sm"
      width={{ sm: 250, lg: 300 }}
      bg={
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : "rgb(249, 249, 248)"
      }
    >
      <SegmentedControl
        fullWidth
        color="indigo"
        value={segment}
        mb={10}
        onChange={(value) => setSegment(value as "tags" | "notes" | "chat")}
        data={[
          {
            value: "notes",
            label: (
              <Center>
                <IconNote size="1rem" />
                <Box ml={10}>Notes</Box>
              </Center>
            ),
          },
          {
            value: "tags",
            label: (
              <Center>
                <IconTags size="1rem" />
                <Box ml={10}>Tags</Box>
              </Center>
            ),
          },
          {
            value: "chat",
            label: (
              <Center>
                <IconSparkles size="1rem" />
                <Box ml={10}>Chat</Box>
              </Center>
            ),
          },
        ]}
      />

      {segment === "tags" &&
        (notes.length > 0 ? (
          <ScrollArea>
            <h1>tags</h1>
          </ScrollArea>
        ) : (
          <Stack h={"60%"} justify="center">
            <EmptyState
              description="Start by selecting some text in the transcript and adding a note."
              imageUrl="/empty-state-images/files/empty-file.svg"
              title="No tags yet..."
            />
          </Stack>
        ))}

      {segment === "notes" &&
        (notes.length > 0 ? (
          <ScrollArea>
            <Stack spacing={"lg"}>
              {notes.map((note) => (
                <Card key={note.id} withBorder>
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
                              <Menu.Item
                                color="red"
                                icon={<IconTrash size={14} />}
                              >
                                Delete
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        </Group>
                      </Stack>
                      <Stack>
                        <Text fz={"sm"}>{note.text}</Text>
                        <Group grow>
                          <Button
                            compact
                            variant="default"
                            leftIcon={<IconPlayerPlay size={"1rem"} />}
                            onClick={() => handlePlayClicked(note)}
                          >
                            Play
                          </Button>
                          <Button
                            compact
                            variant="default"
                            leftIcon={<IconListSearch size={"1rem"} />}
                            onClick={() => handleFindClicked(note)}
                          >
                            Find
                          </Button>
                        </Group>
                      </Stack>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Stack>
          </ScrollArea>
        ) : (
          <Stack h={"60%"} justify="center">
            <EmptyState
              description="Start by selecting some text in the transcript and adding a note."
              imageUrl="/empty-state-images/files/empty-file.svg"
              title="No notes yet..."
            />
          </Stack>
        ))}

      {segment === "chat" && <h1>chat</h1>}
    </Aside>
  );
};
