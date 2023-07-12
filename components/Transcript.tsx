import { Avatar, Button, Popover, Text, TextInput, rem } from "@mantine/core";
import { User } from "@prisma/client";
import { useEffect, useState } from "react";

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

interface CustomPopoverProps {
  onClose: () => void;
  onSubmit: (note: string) => void;
  position: { top: number; left: number };
}

type SelectedTextType = {
  start: number;
  end: number;
  position?: { top: number; left: number };
};

type CommentType = {
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
    <div
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        zIndex: 10,
        backgroundColor: "white",
        padding: "10px",
        borderRadius: "5px",
        boxShadow: "0px 0px 10px rgba(0,0,0,0.1)",
      }}
    >
      <TextInput
        placeholder="Add a note"
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
      />
      <Button
        onClick={() => {
          onSubmit(newComment);
          setNewComment("");
          onClose();
        }}
      >
        Create
      </Button>
    </div>
  );
};

interface CommentPopoverProps {
  position: { top: number; left: number };
  comment: any;
  user: User | null;
}

const CommentPopover: React.FC<CommentPopoverProps> = ({
  position,
  comment,
  user,
}) => {
  return (
    <div
      className="absolute bg-white p-4 rounded-md shadow-md"
      style={{
        top: position.top,
        left: position.left,
        zIndex: 10,
        width: "250px",
      }}
    >
      <div className="flex items-center mb-4">
        <Avatar
          src={user?.image || ""}
          alt={`${user?.name}'s profile picture` || "Default profile picture"}
          radius="xl"
          size={32}
        />
        <h3 className="ml-2 font-medium text-lg">{user?.name}</h3>
      </div>
      <p className="mb-2 font-regular">{comment.note}</p>
      <div className="text-sm text-gray-500">
        <p>{`Commented on ${new Date().toLocaleDateString()}`}</p>
        <p>
          From {comment.start} to {comment.end}
        </p>
      </div>
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
  // Text selection
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

  const handleSpeakerNameChange = (speaker: number, name: string) => {
    setSpeakerNames((prev) => ({ ...prev, [speaker]: name }));
    setNewSpeakerName("");
  };

  const handleTextSelect = (start: number, end: number) => {
    const selection = window.getSelection();
    if (selection) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectedText({
        start,
        end,
        position: {
          top: rect.top + window.scrollY,
          left: rect.left + rect.width + window.scrollX,
        },
      });
    }
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
        const rect = range.getBoundingClientRect();
        const lineRect = startElement.getBoundingClientRect();
        const position = {
          top: rect.top + window.scrollY,
          left: lineRect.left + lineRect.width + window.scrollX,
        };

        return { start, end, position };
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
  // @TODO there might be only 1 speaker, in which case this throws an error
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
        <CustomPopover
          position={selectedText.position!}
          onClose={() => setSelectedText(null)}
          onSubmit={(note) => {
            setComments([
              // @ts-ignore
              ...comments,
              {
                ...selectedText,
                note: note,
                // @ts-ignore
                position: selectedText.position,
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
