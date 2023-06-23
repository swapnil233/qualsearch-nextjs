import { useEffect, useState } from "react";

// mapping of speaker to color
const speakerColor = {
  0: "#00159c",
  1: "#0b7525",
};

function Transcript({ transcript, audioRef }) {
  const [currentWord, setCurrentWord] = useState(null);

  // check word's time range with current audio time
  useEffect(() => {
    const checkTime = () => {
      const currentTime = audioRef.current.currentTime;
      for (let i = 0; i < transcript.length; i++) {
        if (
          currentTime >= transcript[i].start &&
          currentTime <= transcript[i].end
        ) {
          setCurrentWord(i);
          break;
        }
      }
    };

    // add timeupdate event listener to audioRef
    audioRef.current.addEventListener("timeupdate", checkTime);

    return () => {
      // cleanup - remove the event listener
      audioRef.current.removeEventListener("timeupdate", checkTime);
    };
  }, [audioRef, transcript]);

  // group words by speakers
  const groupedTranscript = transcript.reduce((groups, word, index) => {
    const prevSpeaker = groups[groups.length - 1]?.speaker;
    if (word.speaker !== prevSpeaker) {
      groups.push({ speaker: word.speaker, words: [{ ...word, index }] });
    } else {
      groups[groups.length - 1].words.push({ ...word, index });
    }
    return groups;
  }, []);

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
                audioRef.current.currentTime = word.start;
                audioRef.current.play();
              }}
            >
              {word.punctuated_word + " "}
            </span>
          ))}
        </p>
      ))}
    </div>
  );
}

export default Transcript;
