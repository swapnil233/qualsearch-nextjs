import { useNotes } from "@/contexts/NotesContext";
import { useTags } from "@/contexts/TagsContext";
import { useNoteCreation } from "@/hooks/useNoteCreation";
import { Transcript as TranscriptType } from "@/types";
import { TranscriptGrouper } from "@/utils/TranscriptGrouper";
import { calculateNoteCardPosition } from "@/utils/calculateNoteCardPosition";
import { Box, Group } from "@mantine/core";
import { User } from "@prisma/client";
import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import PlayTranscriptBlockButton from "../buttons/PlayTranscriptBlockButton";
import { CreateNotePopover } from "../note/CreateNotePopover";
import { NoteCard } from "../note/NoteCard";
import { SpeakerName } from "../speakers/SpeakerName";
import TranscriptText from "./TranscriptText";
import { SelectedText } from "./interfaces";

interface ITranscriptProps {
  transcript: TranscriptType;
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
  const { notes, setNotes } = useNotes();
  const { tags } = useTags();
  const [currentWord, setCurrentWord] = useState<number>(0);

  const [selectedText, setSelectedText] = useState<SelectedText | null>(null);
  const [noteIsCreating, setNoteIsCreating] = useState<boolean>(false);

  const [speakerNames, setSpeakerNames] = useState<Record<number, string>>({});
  const [newSpeakerName, setNewSpeakerName] = useState<string>("");

  const groupedTranscript = useMemo(() => {
    return new TranscriptGrouper(transcript).groupBySpeaker();
  }, [transcript]);

  const { handleNoteSubmission } = useNoteCreation(
    selectedText,
    setSelectedText,
    transcript,
    user,
    setNoteIsCreating
  );

  // Scroll down to scrollToNoteId if one is provided.
  useEffect(() => {
    if (summaryHasLoaded) {
      const noteToScrollTo = notes.find((note) => note.id === scrollToNoteId);

      if (noteToScrollTo) {
        const notePosition = calculateNoteCardPosition(
          noteToScrollTo.start,
          noteToScrollTo.end,
          transcriptContainerDivRef
        );

        // Scroll to note
        window.scrollTo({
          top: notePosition ? notePosition.top - 100 : 0,
          behavior: "smooth",
        });
      }
    }
  }, [scrollToNoteId, summaryHasLoaded, transcriptContainerDivRef]);

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

    const currentAudio = audioRef.current;

    // add timeupdate event listener to audioRef
    if (currentAudio) {
      currentAudio.addEventListener("timeupdate", checkTime);
    }

    return () => {
      // cleanup - remove the event listener
      if (currentAudio) {
        currentAudio.removeEventListener("timeupdate", checkTime);
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
            <Group mt={"2rem"} mb={"8px"}>
              <SpeakerName
                speaker={group.speaker}
                speakerNames={speakerNames}
                newSpeakerName={newSpeakerName}
                setNewSpeakerName={setNewSpeakerName}
                setSpeakerNames={setSpeakerNames}
              />
              <PlayTranscriptBlockButton
                audioRef={audioRef}
                startingTimestamp={group.words[0].start}
              />
            </Group>
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
