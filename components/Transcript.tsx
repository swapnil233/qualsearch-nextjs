import {
  Box,
  Button,
  Group,
  Popover,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { User } from "@prisma/client";
import { useEffect, useRef, useState } from "react";
import { CommentCard } from "./comment/CommentCard";

const speakerColor: Record<number, string> = {
  0: "#00159c",
  1: "#0b7525",
};

// Props for the main component.
interface ITranscriptProps {
  transcript: {
    start: number;
    end: number;
    speaker: number;
    punctuated_word: string;
  }[];
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  user: User;
}

/**
 words = [
    {
      "end": 3.12,
      "word": "you've",
      "start": 2.96,
      "speaker": 0,
      "confidence": 0.90185547,
      "punctuated_word": "You've",
      "speaker_confidence": 0.568578
    },
    {
      "end": 3.36,
      "word": "been",
      "start": 3.12,
      "speaker": 0,
      "confidence": 0.9995117,
      "punctuated_word": "been",
      "speaker_confidence": 0.568578
    },
    ...
  ]
 */

// How words are grouped by their speaker.
interface IGroup {
  speaker: number;
  words: {
    start: number;
    end: number;
    speaker: number;
    punctuated_word: string;
    // @TODO what is index?
    index: number;
  }[];
}

interface CustomPopoverProps {
  onClose: () => void;
  onSubmit: (note: string) => void;
  position: { top: number; left: number };
}

interface CommentPopoverProps {
  position: { top: number; left: number };
  comment: any;
  user: User;
}

// Structure of the selected text.
type SelectedTextType = {
  start: number;
  end: number;
  position?: { top: number; left: number };
};

// Structure of a comment.
export type CommentType = {
  start: number;
  end: number;
  note: string;
  position: { top: number; left: number };
};

const CustomPopover: React.FC<CustomPopoverProps> = ({
  onClose,
  onSubmit,
  position,
}) => {
  const [newComment, setNewComment] = useState<string>("");

  return (
    <Box
      p={"md"}
      bg={"white"}
      sx={{
        position: "absolute",
        top: position.top,
        left: position.left,
        borderRadius: "5px",
        boxShadow: "0px 0px 10px rgba(0,0,0,0.1)",
      }}
    >
      <Title order={4} fw={500} mb={"sm"}>
        Add a comment
      </Title>
      <Textarea
        placeholder="Comment..."
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        minRows={6}
        w={300}
        mb="md"
      />
      <Group position="apart">
        <Button radius={"xs"} variant="default" onClick={onClose}>
          Cancel
        </Button>
        <Button
          radius={"xs"}
          onClick={() => {
            onSubmit(newComment);
            setNewComment("");
            onClose();
          }}
        >
          Comment
        </Button>
      </Group>
    </Box>
  );
};

const CommentPopover: React.FC<CommentPopoverProps> = ({
  position,
  comment,
  user,
}) => {
  return (
    <div
      className="absolute"
      style={{
        top: position.top,
        left: position.left,
        zIndex: 10,
        width: "400px",
      }}
    >
      <CommentCard
        author={user}
        body={comment}
        position={position}
        postedAt={new Date().toDateString()}
      />
    </div>
  );
};

const Transcript: React.FC<ITranscriptProps> = ({
  transcript,
  audioRef,
  user,
}) => {
  const [currentWord, setCurrentWord] = useState<number>(0);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [selectedText, setSelectedText] = useState<SelectedTextType | null>(
    null
  );
  const [popoverPosition, setPopoverPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [newComment, setNewComment] = useState<string>("");
  const [speakerNames, setSpeakerNames] = useState<Record<number, string>>({});
  const [newSpeakerName, setNewSpeakerName] = useState<string>("");
  const transcriptRef = useRef<HTMLDivElement>(null);
  const [selectedTextTop, setSelectedTextTop] = useState<number>(0);
  const [selectedTextRightEdge, setSelectedTextRightEdge] = useState<number>(
    () => transcriptRef.current?.getBoundingClientRect().right || 0
  );

  console.log(transcriptRef.current);

  const handleTextSelect = (start: number, end: number) => {
    const selection = window.getSelection();
    if (selection) {
      // The range is the selected text.
      const range = selection.getRangeAt(0);

      // The rect is the position of the selected text.
      const rect = range.getBoundingClientRect();

      setSelectedText({
        start,
        end,
        position: {
          top: rect.top + window.scrollY,
          left: rect.left + rect.width + window.scrollX + 16,
        },
      });

      setSelectedTextTop(rect.top + window.scrollY);
      setSelectedTextRightEdge(rect.left + rect.width + window.scrollX);
    }
  };

  const getSelectedTextDetails = () => {
    const selection = window.getSelection();

    if (
      selection &&
      selection.rangeCount > 0 &&
      !selection.isCollapsed // This ensures that there's an actual selection
    ) {
      const range = selection.getRangeAt(0);

      // Returns something like <span data-start="45.06" data-end="45.34" style="...">Word</span> for the start and end elements
      const startElement = range.startContainer.parentElement as HTMLElement;
      const endElement = range.endContainer.parentElement as HTMLElement;

      if (startElement && endElement) {
        // Get the start and end times from the data attributes.
        const start = parseFloat(startElement.dataset.start as string);
        const end = parseFloat(endElement.dataset.end as string);

        // The rect is the position of the selected text.
        const rect = range.getBoundingClientRect();

        // The lineRect is the position of the line that the selected text is on.
        const lineRect = startElement.getBoundingClientRect();

        // The absolute right edge of the transcript container
        // const rightEdge = transcriptRef.current
        //   ? transcriptRef.current.getBoundingClientRect().right + 16
        //   : rect.left + rect.width + 16;

        const rightEdge =
          transcriptRef.current?.getBoundingClientRect().right! + 16;

        const position = {
          top: rect.top + window.scrollY, // Top of the selected text
          left: rightEdge, // The absolute right edge
        };
        return { start, end, position };
      }
    }

    return null;
  };

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

  // Check word's time range with current audio time
  useEffect(() => {
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
   * Group words by speaker
   * @param transcript
   * @returns {IGroup[]}
   * @example [{ speaker: 0, words: [{ word: 'Hello', start: 0, end: 1, index: 0 }] }]
   */
  const groupedTranscript = transcript.reduce<IGroup[]>(
    (groups, word, index) => {
      // Check if the current word's speaker is the same as the previous word's speaker
      const prevSpeaker = groups[groups.length - 1]?.speaker;

      // If the speaker is different, add a new group
      if (word.speaker !== prevSpeaker) {
        groups.push({ speaker: word.speaker, words: [{ ...word, index }] });
      } else {
        // Otherwise, add the word to the current group
        groups[groups.length - 1].words.push({ ...word, index });
      }
      return groups;
    },
    []
  );

  /**
   * Handle the change of the speaker name by updating the state and clearing the input
   * @param speaker
   * @param name
   */
  const handleSpeakerNameChange = (speaker: number, name: string) => {
    setSpeakerNames((prev) => ({
      ...prev,
      [speaker]: name,
    }));
    setNewSpeakerName("");
  };

  return (
    <>
      <div ref={transcriptRef}>
        {groupedTranscript.map((group, groupIndex) => (
          <div key={groupIndex} className="flex flex-col">
            <Popover
              width={300}
              trapFocus
              position="bottom-start"
              withArrow
              shadow="lg"
            >
              <Popover.Target>
                <Text
                  color="#190041"
                  fs={"1.2rem"}
                  mt={"2rem"}
                  mb={"8px"}
                  fw={"bold"}
                  w={"100%"}
                >
                  {/* Either use the speaker name from the state or the speaker name from the transcript */}
                  {speakerNames[group.speaker] || group.speaker}
                </Text>
              </Popover.Target>
              <Popover.Dropdown
                sx={(theme) => ({
                  background:
                    theme.colorScheme === "dark"
                      ? theme.colors.dark[7]
                      : theme.white,
                })}
              >
                <TextInput
                  label="Change speaker name"
                  placeholder="e.g Product Manager or John Doe"
                  mb="md"
                  value={newSpeakerName}
                  onChange={(e) => setNewSpeakerName(e.target.value)}
                />
                <Button
                  size="xs"
                  variant="light"
                  onClick={() => {
                    if (newSpeakerName !== "") {
                      handleSpeakerNameChange(group.speaker, newSpeakerName);
                    }
                  }}
                >
                  Change
                </Button>
              </Popover.Dropdown>
            </Popover>
            <p
              key={groupIndex}
              onMouseUp={() => {
                const selectedText = getSelectedTextDetails();
                selectedText &&
                  handleTextSelect(selectedText.start, selectedText.end);
              }}
            >
              {/* Check if there's a comment for the current word */}
              {group.words.map((word) => {
                const comment: Boolean = comments.some(
                  (comment) =>
                    word.start >= comment.start && word.end <= comment.end
                );

                return (
                  <span
                    key={word.index}
                    data-start={word.start}
                    data-end={word.end}
                    style={
                      word.index === currentWord
                        ? {
                            color: "#190041",
                            cursor: "pointer",
                            fontSize: "1.5rem",
                            boxShadow: "rgba(160, 0, 100, 0.2) 0px 0px 0px 3px",
                            background: "rgba(160, 0, 100, 0.2)",
                            borderRadius: "3px",
                          }
                        : {
                            color: speakerColor[word.speaker],
                            backgroundColor: comment ? "yellow" : "transparent",
                            cursor: "pointer",
                            fontSize: "1.5rem",
                          }
                    }
                    onClick={() => {
                      // seek audio to start time of word
                      if (audioRef.current) {
                        audioRef.current.currentTime = word.start;
                        audioRef.current.play();
                      }
                    }}
                  >
                    {word.punctuated_word + " "}
                  </span>
                );
              })}
            </p>
          </div>
        ))}
      </div>

      {/* Popover for adding comments */}
      {selectedText && (
        <CustomPopover
          position={selectedText.position!}
          onClose={() => setSelectedText(null)}
          onSubmit={(note) => {
            setComments([
              ...comments,
              {
                ...selectedText,
                note: note,
                position: {
                  top: selectedText.position!.top,
                  left:
                    transcriptRef.current?.getBoundingClientRect().right! + 16,
                },
              },
            ]);
            setSelectedText(null);
          }}
        />
      )}

      {comments.map((comment, i) => (
        <CommentPopover
          key={i}
          position={comment.position}
          comment={comment}
          user={user}
        />
      ))}
    </>
  );
};

export default Transcript;
