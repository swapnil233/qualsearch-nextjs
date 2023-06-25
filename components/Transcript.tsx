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
          <p
            key={groupIndex}
            className="mt-8"
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
                          color: "black",
                          textDecoration: "underline",
                          cursor: "pointer",
                          fontSize: "1.5rem",
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
