import { useNotes } from "@/contexts/NotesContext";
import { useTags } from "@/contexts/TagsContext";
import { useNoteCreation } from "@/hooks/useNoteCreation";
import { TranscriptWordsGrouper } from "@/lib/TranscriptGrouper";
import { calculateNoteCardPosition } from "@/lib/calculateNoteCardPosition";
import { SelectedText, TranscriptWord } from "@/types";
import { Box, Group } from "@mantine/core";
import { User } from "@prisma/client";
import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import ScrollToTop from "../affix/ScrollToTop";
import PlayTranscriptBlockButton from "../buttons/PlayTranscriptBlockButton";
import { CreateNotePopover } from "../note/CreateNotePopover";
import { NoteCard } from "../note/NoteCard";
import { SpeakerName } from "../speakers/SpeakerName";
import TranscriptText from "./TranscriptText";

interface ITranscriptProps {
  words: TranscriptWord[];
  mediaRef: React.MutableRefObject<HTMLAudioElement | HTMLVideoElement | null>;
  transcriptContainerDivRef: React.RefObject<HTMLDivElement>;
  user: User;
  scrollToNoteId: string | undefined;
  summaryHasLoaded: Boolean;
}

const Transcript: FC<ITranscriptProps> = ({
  words,
  mediaRef,
  transcriptContainerDivRef,
  user,
  scrollToNoteId,
  summaryHasLoaded,
}) => {
  const { notes, setNotes } = useNotes();
  const { tags } = useTags();
  const [currentWord, setCurrentWord] = useState<number>(0);

  const [selectedText, setSelectedText] = useState<SelectedText | null>(null);
  const [isTextSelected, setIsTextSelected] = useState(false);
  const [noteIsCreating, setNoteIsCreating] = useState<boolean>(false);

  const [speakerNames, setSpeakerNames] = useState<Record<number, string>>({});
  const [newSpeakerName, setNewSpeakerName] = useState<string>("");

  const transcriptWordsGroupedBySpeaker = useMemo(() => {
    return new TranscriptWordsGrouper(words).groupWordsBySpeaker();
  }, [words]);

  const { handleNoteSubmission } = useNoteCreation(
    selectedText,
    setSelectedText,
    words,
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
    // Don't include 'notes' in the dependency array because we don't want to scroll to the note every time the notes state changes.
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
      if (mediaRef.current) {
        const currentTime = mediaRef.current.currentTime;

        // loop through words to find the word that matches the current time
        for (let i = 0; i < words.length; i++) {
          if (currentTime >= words[i].start && currentTime <= words[i].end) {
            setCurrentWord(i);
            break;
          }
        }
      }
    };

    const currentAudio = mediaRef.current;

    // add timeupdate event listener to mediaRef
    if (currentAudio) {
      currentAudio.addEventListener("timeupdate", checkTime);
    }

    return () => {
      // cleanup - remove the event listener
      if (currentAudio) {
        currentAudio.removeEventListener("timeupdate", checkTime);
      }
    };
  }, [mediaRef, words]);

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

    // Update the 'isTextSelected' state.
    setIsTextSelected(true);

    // Remove the selection from the window.
    selection.removeAllRanges();
  };

  const closeNotePopover = () => {
    setSelectedText(null);
    setIsTextSelected(false);
    window.getSelection()?.removeAllRanges();
  };

  const handleWordClick = useCallback(
    (start: number) => {
      if (mediaRef.current) {
        mediaRef.current.currentTime = start;
        mediaRef.current.play();
      }
    },
    [mediaRef]
  );

  return (
    <>
      <Box ref={transcriptContainerDivRef}>
        {transcriptWordsGroupedBySpeaker.map((group, groupIndex) => (
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
                mediaRef={mediaRef}
                startingTimestamp={group.words[0].start}
              />
            </Group>
            <TranscriptText
              transcriptWordsGroupedBySpeaker={group}
              notes={notes}
              currentWord={currentWord}
              onTextSelect={handleTextSelect}
              isTextSelected={isTextSelected}
              onWordClick={handleWordClick}
              selectedRange={
                selectedText
                  ? { start: selectedText.start, end: selectedText.end }
                  : null
              }
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
          onClose={closeNotePopover}
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
            mediaRef={mediaRef}
          />
        );
      })}

      <ScrollToTop />
    </>
  );
};

export default React.memo(Transcript);
