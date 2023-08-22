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

interface ITranscript {
  start: number;
  end: number;
  speaker: number;
  punctuated_word: string;
}

/**
 * Groups the words of the transcript by speaker, so that each group contains all the words spoken by a single speaker.
 * @param transcript
 * @returns {IGroup[]}
 * @example [{ speaker: 0, words: [{ punctuated_word: 'Hello', start: 0, end: 1, index: 0 }] }]
 */
export const groupTranscriptBySpeaker = (
  transcript: ITranscript[]
): IGroup[] => {
  const groupedTranscript: IGroup[] = [];

  for (let i = 0; i < transcript.length; i++) {
    const word = transcript[i];
    // If the groupedTranscript is empty or the speaker of the last group is different from the current word's speaker,
    // push a new group.
    if (
      groupedTranscript.length === 0 ||
      groupedTranscript[groupedTranscript.length - 1].speaker !== word.speaker
    ) {
      groupedTranscript.push({
        speaker: word.speaker,
        words: [{ ...word, index: i }],
      });
    } else {
      // Otherwise, add the word to the last group.
      groupedTranscript[groupedTranscript.length - 1].words.push({
        ...word,
        index: i,
      });
    }
  }

  return groupedTranscript;
};
