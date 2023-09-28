import { useNotes } from "@/contexts/NotesContext";
import { useTags } from "@/contexts/TagsContext";
import { NoteWithTagsAndCreator, TagWithNoteIds } from "@/types";
import { TranscriptGrouper } from "@/utils/TranscriptGrouper";
import { calculateNoteCardPosition } from "@/utils/calculateNoteCardPosition";
import { Box } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { User } from "@prisma/client";
import { IconX } from "@tabler/icons-react";
import { useRouter } from "next/router";
import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import { CreateNotePopover } from "../note/CreateNotePopover";
import { NoteCard } from "../note/NoteCard";
import { SpeakerName } from "../speakers/SpeakerName";
import TranscriptText from "./TranscriptText";
import { SelectedText } from "./interfaces";

interface ITranscriptProps {
  transcript: {
    start: number;
    end: number;
    speaker: number;
    punctuated_word: string;
  }[];
  audioRef: React.MutableRefObject<HTMLAudioElement | HTMLVideoElement | null>;
  transcriptContainerDivRef: React.RefObject<HTMLDivElement>;
  user: User;
  scrollToNoteId: string | undefined;
  summaryHasLoaded: Boolean;
}

const Transcript: FC<ITranscriptProps> = ({
  transcript,
  audioRef,
  transcriptContainerDivRef,
  user,
  scrollToNoteId,
  summaryHasLoaded,
}) => {
  const router = useRouter();
  const { notes, setNotes } = useNotes();
  const { tags, setTags } = useTags();
  const { fileId, projectId } = router.query;
  const [currentWord, setCurrentWord] = useState<number>(0);

  const [selectedText, setSelectedText] = useState<SelectedText | null>(null);
  const [noteIsCreating, setNoteIsCreating] = useState<boolean>(false);

  const [speakerNames, setSpeakerNames] = useState<Record<number, string>>({});
  const [newSpeakerName, setNewSpeakerName] = useState<string>("");

  const groupedTranscript = useMemo(() => {
    return new TranscriptGrouper(transcript).groupBySpeaker();
  }, [transcript]);

  // Scroll down to scrollToNoteId if one is provided.
  useEffect(() => {
    const note = notes.find((note) => note.id === scrollToNoteId);

    if (note) {
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
    }
  }, [scrollToNoteId]);

  // Update note positions after summary loads
  useEffect(() => {
    setNotes((prevNotes) => [...prevNotes]);
  }, [summaryHasLoaded, setNotes]);

  // Update the notes state when the window is resized
  useEffect(() => {
    const handleContentChange = () => setNotes((prevNotes) => [...prevNotes]);

    window.addEventListener("resize", handleContentChange);
    return () => {
      window.removeEventListener("resize", handleContentChange);
    };
  }, [notes, setNotes]);

  // Check word's time range with current audio time
  useEffect(() => {
    const checkTime = () => {
      if (audioRef.current) {
        const currentTime = audioRef.current.currentTime;

        // loop through transcript to find the word that matches the current time
        for (let i = 0; i < transcript.length; i++) {
          if (
            currentTime >= transcript[i].start &&
            currentTime <= transcript[i].end
          ) {
            setCurrentWord(i);
            break;
          }
        }
      }
    };

    // add timeupdate event listener to audioRef
    if (audioRef.current) {
      audioRef.current.addEventListener("timeupdate", checkTime);
    }

    return () => {
      // cleanup - remove the event listener
      if (audioRef.current) {
        audioRef.current.removeEventListener("timeupdate", checkTime);
      }
    };
  }, [audioRef, transcript]);

  // Updates the 'selectedText' state with the details of the selected text including its bounding rectangle.
  const handleTextSelect = (start: number, end: number): void => {
    // Get the current selection from the window.
    const selection = window.getSelection();

    // Return early if no selection is made.
    if (!selection) return;

    // Extract the bounding rectangle of the selected text.
    const selectedTextRectangle = selection
      .getRangeAt(0)
      .getBoundingClientRect();

    // Update the 'selectedText' state with the details of the selection.
    setSelectedText({
      start,
      end,
      selectedTextRectangle,
    });
  };

  /**
   * Create a new note in the database.
   *
   * @param { string } note - The text content of the note.
   * @param { string[] } tags - An array of tags
   * @param { string[] } newTagNamesFromMultiSelect - An array of new tag names created by the user from the multi-select component.
   * @returns { NotesAndUsers } A NotesAndUsers object, containing the newly created note and the ID, name and image of the user who created it.
   */
  const handleNoteSubmission = useCallback(
    async (
      note: string,
      tags: string[],
      newTagNamesFromMultiSelect: string[]
    ) => {
      setNoteIsCreating(true);

      try {
        // Filter out any tags that match new tags created by the user frm the multi-select component
        const filteredTags = tags.filter(
          (tag) => !newTagNamesFromMultiSelect.includes(tag)
        );

        // Check if any of the tags selected are new. If so, create it, and return an array of newly created tags
        const newTagsResponse = await fetch("/api/tags", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            newTagNames: newTagNamesFromMultiSelect,
            projectId: projectId,
            createdByUserId: user.id,
          }),
        });

        if (!newTagsResponse.ok) {
          notifications.show({
            withCloseButton: true,
            autoClose: 5000,
            title: "We couldn't create those tags",
            message:
              "Something went wrong on our end. Try again in a few minutes.",
            color: "red",
            icon: <IconX />,
            loading: false,
          });
          throw new Error(`Error: ${newTagsResponse.statusText}`);
        }

        // The response contains an array of the new tag IDs
        const newTags: TagWithNoteIds[] = await newTagsResponse.json();

        const tagIds = filteredTags.concat(newTags.map((tag) => tag.id));

        const noteData = {
          text: note,
          start: selectedText?.start,
          end: selectedText?.end,
          fileId: fileId,
          projectId: projectId,
          createdByUserId: user.id,
          tagIds: tagIds,
        };

        const newNoteResponse = await fetch("/api/notes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(noteData),
        });

        if (!newNoteResponse.ok) {
          notifications.show({
            withCloseButton: true,
            autoClose: 5000,
            title: "We couldn't create that note",
            message:
              "Something went wrong on our end. Try again in a few minutes.",
            color: "red",
            icon: <IconX />,
            loading: false,
          });
          throw new Error(`Error: ${newNoteResponse.statusText}`);
        }

        const newNote: NoteWithTagsAndCreator = await newNoteResponse.json();

        setNotes((prevNotes) => [...prevNotes, newNote]);
        setTags((prevTags) => [...prevTags, ...newTags]);
        setNoteIsCreating(false);
        setSelectedText(null);
      } catch (error) {
        console.error(error);
      }
    },
    [selectedText, fileId, projectId, user.id, setTags, setNotes]
  );

  const handleWordClick = useCallback(
    (start: number) => {
      if (audioRef.current) {
        audioRef.current.currentTime = start;
        audioRef.current.play();
      }
    },
    [audioRef]
  );

  return (
    <>
      <Box ref={transcriptContainerDivRef}>
        {groupedTranscript.map((group, groupIndex) => (
          <Box key={groupIndex}>
            <SpeakerName
              speaker={group.speaker}
              speakerNames={speakerNames}
              newSpeakerName={newSpeakerName}
              setNewSpeakerName={setNewSpeakerName}
              setSpeakerNames={setSpeakerNames}
              startingTimestamp={group.words[0].start}
              audioRef={audioRef}
            />
            <TranscriptText
              group={group}
              notes={notes}
              currentWord={currentWord}
              onTextSelect={handleTextSelect}
              onWordClick={handleWordClick}
            />
          </Box>
        ))}
      </Box>

      {/* Render the CreateNotePopover if there's a selected text */}
      {selectedText && (
        <CreateNotePopover
          user={user}
          tags={tags}
          position={{
            top:
              selectedText.selectedTextRectangle.bottom + window.scrollY + 16,
            // Left = bounding rect's middle - 1/2 the width of CreateNotePopover
            left:
              selectedText.selectedTextRectangle.left +
              selectedText.selectedTextRectangle.width / 2 -
              150 +
              window.scrollX,
          }}
          onClose={() => setSelectedText(null)}
          noteIsCreating={noteIsCreating}
          onSubmit={handleNoteSubmission}
        />
      )}

      {/* Render the note cards */}
      {notes.map((note, i) => {
        const position = calculateNoteCardPosition(
          note.start,
          note.end,
          transcriptContainerDivRef
        ) || {
          top: 0,
          left: 0,
        };

        return (
          <NoteCard
            key={i}
            position={position}
            note={note}
            audioRef={audioRef}
          />
        );
      })}
    </>
  );
};

export default React.memo(Transcript);
