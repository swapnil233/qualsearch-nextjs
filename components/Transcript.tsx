import { Button, Popover, Text, TextInput, rem } from "@mantine/core";
import { User } from "@prisma/client";
import { useEffect, useState } from "react";
import CommentForm from "./CommentForm";

// mapping of speaker to color
const speakerColor: Record<number, string> = {
  0: "#00159c",
  1: "#0b7525",
};

interface ITranscriptProps {
  transcript: {
    start: number;
    end: number;
    speaker: number;
    punctuated_word: string;
  }[];
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  user: User | null;
}

interface IGroup {
  speaker: number;
  words: {
    start: number;
    end: number;
    speaker: number;
    punctuated_word: string;
    index: number;
  }[];
}

const Transcript: React.FC<ITranscriptProps> = ({
  transcript,
  audioRef,
  user,
}) => {
  const [currentWord, setCurrentWord] = useState<number>(0);
  const [comments, setComments] = useState<
    { start: number; end: number; note: string }[]
  >([]);

  const [selectedText, setSelectedText] = useState<{
    start: number;
    end: number;
  } | null>(null);

  const [speakerNames, setSpeakerNames] = useState<Record<number, string>>({});
  const [newSpeakerName, setNewSpeakerName] = useState<string>("");

  const handleSpeakerNameChange = (speaker: number, name: string) => {
    setSpeakerNames((prev) => ({ ...prev, [speaker]: name }));
    setNewSpeakerName("");
  };

  const handleTextSelect = (start: number, end: number) => {
    setSelectedText({ start, end });
  };

  const getSelectedTextDetails = () => {
    const selection = window.getSelection();

    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);

      const startElement = range.startContainer.parentElement as HTMLElement;
      const endElement = range.endContainer.parentElement as HTMLElement;

      if (startElement && endElement) {
        const start = parseFloat(startElement.dataset.start as string);
        const end = parseFloat(endElement.dataset.end as string);

        return { start, end };
      }
    }

    return null;
  };

  // check word's time range with current audio time
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

  // group words by speakers
  const groupedTranscript = transcript.reduce<IGroup[]>(
    (groups, word, index) => {
      const prevSpeaker = groups[groups.length - 1]?.speaker;
      if (word.speaker !== prevSpeaker) {
        groups.push({ speaker: word.speaker, words: [{ ...word, index }] });
      } else {
        groups[groups.length - 1].words.push({ ...word, index });
      }
      return groups;
    },
    []
  );

  return (
    <>
      <div>
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
                  label="Speaker name"
                  placeholder="eg Product Manager"
                  size="xs"
                  mb={rem(10)}
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
                if (selectedText) {
                  handleTextSelect(selectedText.start, selectedText.end);
                }
              }}
            >
              {group.words.map((word) => {
                const comment = comments.some(
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
                            // lineHeight: "48px",
                            boxShadow: "rgba(160, 0, 100, 0.2) 0px 0px 0px 3px",
                            background: "rgba(160, 0, 100, 0.2)",
                            borderRadius: "3px",
                          }
                        : {
                            color: speakerColor[word.speaker],
                            backgroundColor: comment ? "yellow" : "transparent",
                            cursor: "pointer",
                            fontSize: "1.5rem",
                            // lineHeight: "28px",
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
      {selectedText && (
        <CommentForm
          onSubmit={(note) => {
            setComments([...comments, { ...selectedText, note }]);
            setSelectedText(null);
          }}
        />
      )}
      {comments.map((comment, i) => (
        <div key={i}>
          <h3>Comment:</h3>
          <p>
            From {comment.start} to {comment.end}
          </p>
          <p>
            Commented by {user?.name} at {new Date().toLocaleString()}
          </p>
          <p>{comment.note}</p>
        </div>
      ))}
    </>
  );
};

export default Transcript;
