import { NotesAndUsers } from "@/types";
import { User } from "@prisma/client";

// Props for the main component.
export interface ITranscriptProps {
  transcript: {
    start: number;
    end: number;
    speaker: number;
    punctuated_word: string;
  }[];
  audioRef: React.MutableRefObject<HTMLAudioElement | HTMLVideoElement | null>;
  user: User;
  existingNotes: NotesAndUsers[];
  fileId: string;
  projectId: string;
  summaryHasLoaded: Boolean;
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

export interface IGroup {
  speaker: number;
  words: {
    start: number;
    end: number;
    speaker: number;
    punctuated_word: string;
    index: number;
  }[];
}

export interface ITranscript {
  start: number;
  end: number;
  speaker: number;
  punctuated_word: string;
}
