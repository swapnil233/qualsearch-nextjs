import { IGroup } from "@/components/transcript/interfaces";
import { TranscriptWord } from "@/types";

export class TranscriptWordsGrouper {
  words: TranscriptWord[];

  constructor(words: TranscriptWord[]) {
    this.words = words;
  }

  groupWordsBySpeaker(): IGroup[] {
    const wordsGroupedBySpeaker: IGroup[] = [];

    for (let i = 0; i < this.words.length; i++) {
      const word = this.words[i];

      if (
        wordsGroupedBySpeaker.length === 0 ||
        wordsGroupedBySpeaker[wordsGroupedBySpeaker.length - 1].speaker !==
          word.speaker
      ) {
        wordsGroupedBySpeaker.push({
          speaker: word.speaker,
          words: [{ ...word, index: i }],
        });
      } else {
        wordsGroupedBySpeaker[wordsGroupedBySpeaker.length - 1].words.push({
          ...word,
          index: i,
        });
      }
    }

    return wordsGroupedBySpeaker;
  }
}
