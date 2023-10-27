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
