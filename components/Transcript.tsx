import {
  IGroup,
  groupTranscriptBySpeaker,
} from "@/utils/groupTranscriptBySpeaker";
import { Button, Popover, Text, TextInput } from "@mantine/core";
import { User } from "@prisma/client";
import { useEffect, useRef, useState } from "react";
import { CommentCard, CommentType } from "./comment/CommentCard";
import { CreateCommentPopover } from "./comment/CreateCommentPopover";

const speakerColor: Record<number, string> = {
  0: "#00159c",
  1: "#0b7525",
};

// Props for the main component.
export interface ITranscriptProps {
  transcript: {
    start: number;
    end: number;
    speaker: number;
    punctuated_word: string;
  }[];
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  user: User;
}

// Structure of the selected text.
type SelectedTextType = {
  start: number;
  end: number;
  position?: { top: number; left: number };
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
  const [speakerNames, setSpeakerNames] = useState<Record<number, string>>({});
  const [newSpeakerName, setNewSpeakerName] = useState<string>("");
  const transcriptRef = useRef<HTMLDivElement>(null);

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

        const rightEdge =
          transcriptRef.current?.getBoundingClientRect().right! + 16;

        const position = {
          top: rect.top + window.scrollY, // Top of the selected text
          left: rightEdge, // The right edge of the div containing the transcript + 16px
        };
        return { start, end, position };
      }
    }

    return null;
  };

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

  const groupedTranscript: IGroup[] = groupTranscriptBySpeaker(transcript);

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

  // Add event listener for spacebar to play/pause audio
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        // If the event's target is the video element, just return
        if (event.target === audioRef.current) {
          return;
        }

        event.preventDefault();

        // Toggle play/pause of the audio/video
        if (audioRef.current) {
          if (audioRef.current.paused) {
            audioRef.current.play();
          } else {
            audioRef.current.pause();
          }
        }
      }
    };

    // Add the event listener
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup - remove the event listener
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [audioRef]);

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
                  sx={{
                    cursor: "pointer",
                    ":hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  {/* Either use the speaker name from the state or the speaker name from the transcript */}
                  {speakerNames[group.speaker] ||
                    `Speaker ${group.speaker + 1}`}
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
                  placeholder={
                    speakerNames[group.speaker] ||
                    `Speaker ${group.speaker + 1}`
                  }
                  mb="md"
                  value={newSpeakerName}
                  onChange={(e) => {
                    setNewSpeakerName(e.target.value);
                    // Close the popover after setting the new speaker name
                  }}
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
                const isComment = comments.some(
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
                            boxShadow: isComment
                              ? "rgb(255 115 0 / 60%) 0px 3px 0px 0px"
                              : "none",
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
        <CreateCommentPopover
          user={user}
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
        <CommentCard
          key={i}
          position={comment.position}
          body={comment}
          author={user}
          postedAt={new Date().toDateString()}
        />
      ))}
    </>
  );
};

export default Transcript;
