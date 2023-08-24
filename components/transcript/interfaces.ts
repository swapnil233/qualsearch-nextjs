import { Note, User } from "@prisma/client";

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
  notes: Note[];
}

export type SelectedTextRectangle = {
  top: number;
  right: number;
  bottom: number;
  left: number;
  width: number;
  height: number;
};

// Structure of the selected text.
export type SelectedText = {
  start: number;
  end: number;
  selectedTextRectangle: SelectedTextRectangle;
};
