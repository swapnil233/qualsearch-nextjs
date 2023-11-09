import { useNotes } from "@/contexts/NotesContext";
import { useTags } from "@/contexts/TagsContext";
import { NoteWithTagsAndCreator } from "@/types";
import {
  Aside,
  Box,
  Button,
  Center,
  Divider,
  Group,
  ScrollArea,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  rem,
  useMantineTheme,
} from "@mantine/core";
import { User } from "@prisma/client";
import {
  IconDownload,
  IconListSearch,
  IconNote,
  IconSparkles,
  IconTags,
  IconUpload,
} from "@tabler/icons-react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import EmptyState from "../states/empty/EmptyState";
import { AsideAiChat } from "./AsideAiChat";
import { AsideNotes } from "./AsideNotes";
import { AsideTags } from "./AsideTags";

interface ITranscriptPageAside {
  user: User;

  segment: "tags" | "notes" | "ai";
  setSegment: React.Dispatch<React.SetStateAction<"tags" | "notes" | "ai">>;

  mediaRef: React.MutableRefObject<HTMLAudioElement | HTMLVideoElement | null>;
  transcriptContainerDivRef: React.RefObject<HTMLDivElement>;

  fileId: string;
  transcriptId: string;
}

export const TranscriptPageAside: React.FC<ITranscriptPageAside> = ({
  segment,
  setSegment,
  mediaRef,
  transcriptContainerDivRef,
  user,
  fileId,
  transcriptId,
}) => {
  const { notes } = useNotes();
  const { tags, setTags } = useTags();
  const theme = useMantineTheme();

  const router = useRouter();
  const { projectId } = router.query;

  const [filteredNotes, setFilteredNotes] =
    useState<NoteWithTagsAndCreator[]>(notes);

  const [search, setSearch] = useState("");

  // Filter notes by search term
  useEffect(() => {
    if (search) {
      setFilteredNotes(
        notes.filter(
          (note) =>
            note.text.toLowerCase().includes(search.toLowerCase()) ||
            note.transcriptText.toLowerCase().includes(search.toLowerCase())
        )
      );
    } else {
      setFilteredNotes(notes);
    }
  }, [search, notes]);

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
          onChange={(value) => setSegment(value as "tags" | "notes" | "ai")}
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
              value: "ai",
              label: (
                <Center>
                  <IconSparkles size="1rem" />
                  <Box ml={10}>AI</Box>
                </Center>
              ),
            },
          ]}
        />

        {segment === "notes" && (
          <>
            {notes.length > 0 ? (
              <>
                <TextInput
                  label="Filter by note"
                  icon={<IconListSearch />}
                  placeholder="Start typing to filter notes..."
                  onChange={(e) =>
                    setSearch(e.target.value.toLocaleLowerCase())
                  }
                />
                <ScrollArea h={470}>
                  <AsideNotes
                    search={search}
                    mediaRef={mediaRef}
                    transcriptContainerDivRef={transcriptContainerDivRef}
                    notes={filteredNotes}
                  />
                  {search.length > 0 && filteredNotes.length === 0 && (
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
              <ScrollArea>
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

        {segment === "ai" && (
          <>
            <Box h={800}>
              <AsideAiChat fileId={fileId} transcriptId={transcriptId} />
            </Box>
          </>
        )}
      </Stack>
    </Aside>
  );
};
