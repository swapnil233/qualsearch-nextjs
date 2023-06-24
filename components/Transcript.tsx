import { useEffect, useState } from "react";

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

const Transcript: React.FC<ITranscriptProps> = ({ transcript, audioRef }) => {
  const [currentWord, setCurrentWord] = useState<number>(0);

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
    <div>
      {groupedTranscript.map((group, groupIndex) => (
        <p key={groupIndex} className="mt-8">
          {group.words.map((word) => (
            <span
              key={word.index}
              style={
                word.index === currentWord
                  ? {
                      color: "black",
                      textDecoration: "underline",
                      //   backgroundColor: "yellow",
                      cursor: "pointer",
                      fontSize: "1.5rem",
                    }
                  : {
                      color: speakerColor[word.speaker],
                      backgroundColor: "transparent",
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
          ))}
        </p>
      ))}
    </div>
  );
};

export default Transcript;
