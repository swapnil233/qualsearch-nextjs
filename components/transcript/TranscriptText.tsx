import useSelectedTextDetails from "@/hooks/useSelectedTextDetails";
import {
  NoteWithTagsAndCreator,
  TranscriptWordsGroupedBySpeaker,
} from "@/types";
import { Text, useMantineTheme } from "@mantine/core";
import React, { useMemo } from "react";

interface ITranscriptTextProps {
  transcriptWordsGroupedBySpeaker: TranscriptWordsGroupedBySpeaker;
  notes: NoteWithTagsAndCreator[];
  currentWord: number;
  onTextSelect: (_start: number, _end: number) => void;
  isTextSelected: boolean;
  selectedRange: { start: number; end: number } | null;
  onWordClick: (_start: number) => void;
}

const DEFAULT_STYLE = {
  // cursor: "pointer",
  fontSize: "1.2rem",
};

const TranscriptText: React.FC<ITranscriptTextProps> = ({
  transcriptWordsGroupedBySpeaker,
  notes,
  currentWord,
  onTextSelect,
  isTextSelected,
  selectedRange,
  onWordClick,
}) => {
  const getSelectedTextDetails = useSelectedTextDetails();
  const theme = useMantineTheme();

  const styles = useMemo(() => {
    const lightScheme = theme.colorScheme === "light";
    return {
      noteUnderline: lightScheme
        ? "rgb(255 149 62 / 60%) 0px 3px 0px 0px"
        : "rgb(122 48 0) 0px 3px 0px 0px",
      noteBackground: lightScheme ? "rgb(255 245 239)" : "rgb(62 23 0)",
      currentWordDecoration: "rgba(160, 0, 100, 0.2)",
    };
  }, [theme]);

  const selectedTextStyle = isTextSelected
    ? {
        // boxShadow: styles.noteUnderline,
        background: styles.noteBackground,
      }
    : {};

  const handleMouseUp = () => {
    const selectedText = getSelectedTextDetails();
    selectedText && onTextSelect(selectedText.start, selectedText.end);
  };

  return (
    <Text onMouseUp={handleMouseUp} lh={1.7}>
      {transcriptWordsGroupedBySpeaker.words.map((word) => {
        const isNote = notes.some(
          (note) => word.start >= note.start && word.end <= note.end
        );

        const isCurrentWord = word.index === currentWord;

        const currentWordStyle = isCurrentWord
          ? {
              boxShadow: `rgba(160, 0, 100, 0.2) 0px 0px 0px 3px`,
              background: styles.currentWordDecoration,
              borderRadius: "3px",
            }
          : {};

        const combinedStyle = {
          ...DEFAULT_STYLE,
          boxShadow: isNote ? styles.noteUnderline : "none",
          background: isNote ? styles.noteBackground : "",
          ...currentWordStyle,
        };

        // Check if the word is within the selected range
        const isSelected =
          selectedRange &&
          word.start >= selectedRange.start &&
          word.end <= selectedRange.end;
        const selectedStyle = isSelected ? selectedTextStyle : {};

        return (
          <span
            key={word.index}
            data-start={word.start}
            data-end={word.end}
            style={{ ...combinedStyle, ...selectedStyle }}
            onClick={() => onWordClick(word.start)}
          >
            {word.punctuated_word + " "}
          </span>
        );
      })}
    </Text>
  );
};

export default React.memo(TranscriptText);
