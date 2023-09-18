import { NoteWithTagsAndCreator, TagWithNoteIds } from "@/types";
import {
  Aside,
  Box,
  Button,
  Center,
  Divider,
  Group,
  NativeSelect,
  ScrollArea,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  rem,
  useMantineTheme,
} from "@mantine/core";
import { useDebouncedState } from "@mantine/hooks";
import { User } from "@prisma/client";
import {
  IconDownload,
  IconNote,
  IconSearch,
  IconSparkles,
  IconTags,
  IconUpload,
} from "@tabler/icons-react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import EmptyState from "../states/empty/EmptyState";
import { AsideNotes } from "./AsideNotes";
import { AsideTags } from "./AsideTags";

interface ITranscriptPageAside {
  notes: NoteWithTagsAndCreator[];
  user: User;

  tags: TagWithNoteIds[];
  setTags: React.Dispatch<React.SetStateAction<TagWithNoteIds[]>>;

  segment: "tags" | "notes" | "chat";
  setSegment: React.Dispatch<React.SetStateAction<"tags" | "notes" | "chat">>;

  mediaRef: React.MutableRefObject<HTMLAudioElement | HTMLVideoElement | null>;
  transcriptContainerDivRef: React.RefObject<HTMLDivElement>;
}

type SortCategories = "newest-to-oldest" | "oldest-to-newest" | "chronological";

export const TranscriptPageAside: React.FC<ITranscriptPageAside> = ({
  segment,
  setSegment,
  notes,
  tags,
  setTags,
  mediaRef,
  transcriptContainerDivRef,
  user,
}) => {
  const theme = useMantineTheme();

  const router = useRouter();
  const { projectId } = router.query;

  const [filteredNotes, setFilteredNotes] =
    useState<NoteWithTagsAndCreator[]>(notes);

  useEffect(() => {
    setFilteredNotes(notes);
    console.log("Filtered notes", filteredNotes);
  }, [notes, filteredNotes]);

  const [searchTerm, setSearchTerm] = useDebouncedState("", 200);

  const [sort, setSort] = useState<SortCategories>();

  // Filter notes by search term
  useEffect(() => {
    const filterNotesBySearchTerm = () => {
      if (searchTerm.length > 0) {
        const filteredNotes = notes.filter((note) =>
          note.text.toLocaleLowerCase().includes(searchTerm)
        );
        return filteredNotes;
      } else {
        return notes;
      }
    };

    const filteredNotes = filterNotesBySearchTerm();
    setFilteredNotes(filteredNotes);
  }, [searchTerm, notes]);

  // Sort notes by sort category
  useEffect(() => {
    let sortedNotes = [...filteredNotes];
    switch (sort) {
      case "newest-to-oldest":
        console.log("newest-to-oldest");
        sortedNotes.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "oldest-to-newest":
        console.log("oldest-to-newest");
        sortedNotes.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case "chronological":
        console.log("chronological");
        sortedNotes.sort((a, b) => a.start - b.start);
        break;
      default:
        console.log("sortNotes() error");
    }
    setFilteredNotes(sortedNotes);
  }, [sort, notes]);

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
      <Stack>
        <SegmentedControl
          fullWidth
          value={segment}
          transitionDuration={100}
          mb={rem(16)}
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

        {segment === "notes" && (
          <>
            {notes.length > 0 ? (
              <>
                <Group noWrap>
                  <TextInput
                    icon={<IconSearch size="1rem" />}
                    placeholder="Search..."
                    onChange={(e) =>
                      setSearchTerm(e.currentTarget.value.toLocaleLowerCase())
                    }
                  />
                  <NativeSelect
                    data={[
                      { value: "newest-to-oldest", label: "Newest to oldest" },
                      { value: "oldest-to-newest", label: "Oldest to newest" },
                      { value: "chronological", label: "Chronological" },
                    ]}
                    value={sort}
                    variant="filled"
                    onChange={(e) =>
                      setSort(e.currentTarget.value as SortCategories)
                    }
                  />
                </Group>
                <ScrollArea h={420}>
                  <AsideNotes
                    mediaRef={mediaRef}
                    transcriptContainerDivRef={transcriptContainerDivRef}
                    notes={filteredNotes}
                  />
                  {searchTerm.length > 0 && filteredNotes.length === 0 && (
                    <Stack h={"100%"} spacing={"lg"} align="center" mt={"md"}>
                      <Text color="dimmed">No matching notes found...</Text>
                    </Stack>
                  )}
                </ScrollArea>
                {filteredNotes.length > 0 && (
                  <>
                    <Divider mt={"md"} />
                    {/* @TODO implement import and export features */}
                    <Group position="apart">
                      <Button
                        compact
                        variant="subtle"
                        leftIcon={<IconUpload size={16} />}
                      >
                        Import
                      </Button>
                      <Button
                        compact
                        variant="subtle"
                        leftIcon={<IconDownload size={16} />}
                      >
                        Export
                      </Button>
                    </Group>
                  </>
                )}
              </>
            ) : (
              <Stack justify="center">
                <EmptyState
                  description="Start by selecting some text in the transcript and adding a note."
                  imageUrl="/empty-state-images/files/empty-file.svg"
                  title="No notes yet..."
                />
              </Stack>
            )}
          </>
        )}

        {segment === "tags" && (
          <>
            {tags.length > 0 ? (
              <ScrollArea h={"100%"}>
                <AsideTags
                  tags={tags}
                  setTags={setTags}
                  projectId={projectId as string}
                  user={user}
                />
              </ScrollArea>
            ) : (
              <Stack h={"60%"} justify="center">
                <EmptyState
                  description="Start by selecting some text in the transcript and adding a note."
                  imageUrl="/empty-state-images/files/empty-file.svg"
                  title="No notes yet..."
                />
              </Stack>
            )}
          </>
        )}

        {segment === "chat" && <h1>chat</h1>}
      </Stack>
    </Aside>
  );
};
