import { NoteWithTagsAndCreator } from "@/types";
import { TranscriptGrouper } from "@/utils/TranscriptGrouper";
import { Box } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { User } from "@prisma/client";
import { IconX } from "@tabler/icons-react";
import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CreateNotePopover } from "../note/CreateNotePopover";
import { NoteCard } from "../note/NoteCard";
import { SpeakerName } from "../speakers/SpeakerName";
import TranscriptText from "./TranscriptText";
import { SelectedText, TagWithNotes } from "./interfaces";

interface ITranscriptProps {
  transcript: {
    start: number;
    end: number;
    speaker: number;
    punctuated_word: string;
  }[];
  audioRef: React.MutableRefObject<HTMLAudioElement | HTMLVideoElement | null>;
  user: User;
  existingNotes: NoteWithTagsAndCreator[];
  tags: TagWithNotes[];
  fileId: string;
  projectId: string;
  summaryHasLoaded: Boolean;
}

const Transcript: FC<ITranscriptProps> = ({
  transcript,
  audioRef,
  user,
  fileId,
  projectId,
  existingNotes,
  tags,
  summaryHasLoaded,
}) => {
  const [currentWord, setCurrentWord] = useState<number>(0);

  const transcriptRef = useRef<HTMLDivElement>(null);
  const [notes, setNotes] = useState<NoteWithTagsAndCreator[]>(existingNotes);
  const [selectedText, setSelectedText] = useState<SelectedText | null>(null);
  const [noteIsCreating, setNoteIsCreating] = useState<boolean>(false);

  const [speakerNames, setSpeakerNames] = useState<Record<number, string>>({});
  const [newSpeakerName, setNewSpeakerName] = useState<string>("");

  const groupedTranscript = useMemo(() => {
    return new TranscriptGrouper(transcript).groupBySpeaker();
  }, [transcript]);

  // Update note positions after summary loads
  useEffect(() => {
    setNotes((prevNotes) => [...prevNotes]);
  }, [summaryHasLoaded]);

  // Update the notes state when the window is resized
  useEffect(() => {
    const handleContentChange = () => setNotes((prevNotes) => [...prevNotes]);

    window.addEventListener("resize", handleContentChange);
    return () => {
      window.removeEventListener("resize", handleContentChange);
    };
  }, [notes]);

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

  /**
   * Handles the selection of text on the screen.
   * Updates the 'selectedText' state with the details of the selected text including its bounding rectangle.
   *
   * @param {number} start - The start time of the selected text.
   * @param {number} end - The end time of the selected text.
   */
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
   * Calculate the position of a note based on the start and end times of the selected text.
   *
   * @param {number} start - The start time of the selected text.
   * @param {number} end - The end time of the selected text.
   * @returns { {top: number, left: number} | null } The position object containing 'top' and 'left' coordinates of the note or null if the start and end elements are not found.
   */
  const calculateNoteCardPosition = (
    start: number,
    end: number
  ): { top: number; left: number } | null => {
    // Find the start and end elements based on data attributes.
    const startElement = Array.from(
      transcriptRef.current?.querySelectorAll(`[data-start="${start}"]`) || []
    )[0] as HTMLElement;
    const endElement = Array.from(
      transcriptRef.current?.querySelectorAll(`[data-end="${end}"]`) || []
    )[0] as HTMLElement;

    // If either start or end element is not found, return null.
    if (!startElement || !endElement) return null;

    const range = document.createRange();
    range.setStart(startElement, 0);

    // Check if endElement is a text node and set the range accordingly.
    if (endElement.nodeType === Node.TEXT_NODE) {
      range.setEnd(endElement, endElement.textContent?.length ?? 0);
    } else {
      range.setEnd(endElement, endElement.childNodes.length);
    }

    // Calculate the bounding rectangle for the selected range.
    const boundingRectangle = range.getBoundingClientRect();

    // Calculate the right edge position.
    const rightEdge =
      (transcriptRef.current?.getBoundingClientRect().right || 0) + 16;

    // Return the top and left positions for the note.
    return {
      top: boundingRectangle.top + window.scrollY,
      left: rightEdge,
    };
  };

  /**
   * Create a new note in the database.
   *
   * @param { string } note - The text content of the note.
   * @param { string[] } tags - An array of tags
   * @returns { NotesAndUsers } A NotesAndUsers object, containing the newly created note and the ID, name and image of the user who created it.
   */
  const handleNoteSubmission = useCallback(
    async (note: string, tags: string[], newTags: string[]) => {
      setNoteIsCreating(true);
      try {
        // Check and create new tags at /api/tags
        const newTagIdsResponse = await fetch("/api/tags", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            newTagNames: newTags,
            projectId: projectId,
            createdByUserId: user.id,
          }),
        });

        if (!newTagIdsResponse.ok) {
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
          throw new Error(`Error: ${newTagIdsResponse.statusText}`);
        }

        // The response contains an array of the new tag IDs
        const newTagIds: string[] = await newTagIdsResponse.json();

        // Combine the new tag IDs with the existing tag IDs
        const tagIds = [...tags, ...newTagIds];

        const noteData = {
          text: note,
          start: selectedText?.start,
          end: selectedText?.end,
          fileId: fileId,
          projectId: projectId,
          createdByUserId: user.id,
          tags: tagIds,
        };

        const response = await fetch("/api/notes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(noteData),
        });

        if (!response.ok) {
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
          throw new Error(`Error: ${response.statusText}`);
        }

        const newNote: NoteWithTagsAndCreator = await response.json();

        setNotes((prevNotes) => [...prevNotes, newNote]);
        setNoteIsCreating(false);
        setSelectedText(null);
      } catch (error) {
        console.error(error);
      }
    },
    [selectedText, fileId, projectId, user.id]
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
      <Box ref={transcriptRef}>
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
        const position = calculateNoteCardPosition(note.start, note.end) || {
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