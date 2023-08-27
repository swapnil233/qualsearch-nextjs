import useSelectedTextDetails from "@/hooks/useSelectedTextDetails";
import { NotesAndUsers } from "@/types";
import { IGroup } from "./interfaces";

const speakerColor: Record<number, string> = {
  0: "#00159c",
  1: "#0b7525",
};

interface ITranscriptTextProps {
  group: IGroup;
  notes: NotesAndUsers[];
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

  return (
    <p
      onMouseUp={() => {
        const selectedText = getSelectedTextDetails();
        selectedText && onTextSelect(selectedText.start, selectedText.end);
      }}
    >
      {group.words.map((word) => {
        const isNote = notes.some(
          (note) => word.start >= note.start && word.end <= note.end
        );

        const isCurrentWord = word.index === currentWord;

        const defaultStyle = {
          color: speakerColor[word.speaker],
          boxShadow: isNote ? "rgb(255 115 0 / 60%) 0px 3px 0px 0px" : "none",
          cursor: "pointer",
          fontSize: "1.2rem",
        };

        const currentWordStyle = {
          color: "#190041",
          boxShadow: "rgba(160, 0, 100, 0.2) 0px 0px 0px 3px",
          background: "rgba(160, 0, 100, 0.2)",
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
    </p>
  );
};

export default TranscriptText;
