import useSelectedTextDetails from "@/hooks/useSelectedTextDetails";
import { NoteWithTagsAndCreator } from "@/types";
import { Text, useMantineTheme } from "@mantine/core";
import { IGroup } from "./interfaces";

interface ITranscriptTextProps {
  group: IGroup;
  notes: NoteWithTagsAndCreator[];
  currentWord: number;
  onTextSelect: (_start: number, _end: number) => void;
  onWordClick: (_start: number) => void;
}

const TranscriptText: React.FC<ITranscriptTextProps> = ({
  group,
  notes,
  currentWord,
  onTextSelect,
  onWordClick,
}) => {
  const getSelectedTextDetails = useSelectedTextDetails();
  const theme = useMantineTheme();

  const noteUnderline =
    theme.colorScheme === "light"
      ? "rgb(255 149 62 / 60%) 0px 3px 0px 0px"
      : "rgb(122 48 0) 0px 3px 0px 0px";

  const noteBackground =
    theme.colorScheme === "light" ? "rgb(255 245 239)" : "rgb(62 23 0)";

  const currentWordOuterDecoration =
    theme.colorScheme === "light"
      ? "rgba(160, 0, 100, 0.2) 0px 0px 0px 3px"
      : "rgba(160, 0, 100, 0.2) 0px 0px 0px 3px";

  const currentWordInnerDecoration =
    theme.colorScheme === "light"
      ? "rgba(160, 0, 100, 0.2)"
      : "rgba(160, 0, 100, 0.2)";

  return (
    <Text
      onMouseUp={() => {
        const selectedText = getSelectedTextDetails();
        selectedText && onTextSelect(selectedText.start, selectedText.end);
      }}
      lh={1.7}
    >
      {group.words.map((word) => {
        const isNote = notes.some(
          (note) => word.start >= note.start && word.end <= note.end
        );

        const isCurrentWord = word.index === currentWord;

        const defaultStyle = {
          boxShadow: isNote ? noteUnderline : "none",
          background: isNote ? noteBackground : "",
          cursor: "pointer",
          fontSize: "1.2rem",
        };

        const currentWordStyle = {
          boxShadow: currentWordOuterDecoration,
          background: currentWordInnerDecoration,
          borderRadius: "3px",
        };

        const combinedStyle = {
          ...defaultStyle,
          ...(isCurrentWord ? currentWordStyle : {}),
        };

        return (
          <span
            key={word.index}
            data-start={word.start}
            data-end={word.end}
            style={combinedStyle}
            onClick={() => onWordClick(word.start)}
          >
            {word.punctuated_word + " "}
          </span>
        );
      })}
    </Text>
  );
};

export default TranscriptText;
