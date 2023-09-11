import { NoteWithTagsAndCreator, TagWithNotes } from "@/types";
import {
  Aside,
  Box,
  Center,
  ScrollArea,
  SegmentedControl,
  Stack,
  rem,
  useMantineTheme,
} from "@mantine/core";
import { User } from "@prisma/client";
import { IconNote, IconSparkles, IconTags } from "@tabler/icons-react";
import React from "react";
import EmptyState from "../states/empty/EmptyState";
import { AsideNotes } from "./AsideNotes";
import { AsideTags } from "./AsideTags";

interface ITranscriptPageAside {
  notes: NoteWithTagsAndCreator[];
  tags: TagWithNotes[];
  setTags: React.Dispatch<React.SetStateAction<TagWithNotes[]>>;
  segment: "tags" | "notes" | "chat";
  setSegment: React.Dispatch<React.SetStateAction<"tags" | "notes" | "chat">>;
  mediaRef: React.MutableRefObject<HTMLAudioElement | HTMLVideoElement | null>;
  transcriptContainerDivRef: React.RefObject<HTMLDivElement>;
  projectId: string;
  user: User;
}

export const TranscriptPageAside: React.FC<ITranscriptPageAside> = ({
  segment,
  setSegment,
  notes,
  tags,
  setTags,
  mediaRef,
  transcriptContainerDivRef,
  projectId,
  user,
}) => {
  const theme = useMantineTheme();

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
            <ScrollArea h={"100%"}>
              <AsideNotes
                mediaRef={mediaRef}
                transcriptContainerDivRef={transcriptContainerDivRef}
                notes={notes}
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

      {segment === "tags" && (
        <>
          {tags.length > 0 ? (
            <ScrollArea h={"100%"}>
              <AsideTags
                tags={tags}
                setTags={setTags}
                projectId={projectId}
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
    </Aside>
  );
};
