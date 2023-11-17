import { TranscriptWord, TranscriptWordsGroupedBySpeaker } from "@/types";

export class TranscriptWordsGrouper {
  words: TranscriptWord[];

  constructor(words: TranscriptWord[]) {
    this.words = words;
  }

  groupWordsBySpeaker(): TranscriptWordsGroupedBySpeaker[] {
    const transcriptWordsGroupedBySpeaker: TranscriptWordsGroupedBySpeaker[] =
      [];

    for (let i = 0; i < this.words.length; i++) {
      const word = this.words[i];

      if (
        transcriptWordsGroupedBySpeaker.length === 0 ||
        transcriptWordsGroupedBySpeaker[
          transcriptWordsGroupedBySpeaker.length - 1
        ].speaker !== word.speaker
      ) {
        transcriptWordsGroupedBySpeaker.push({
          speaker: word.speaker,
          words: [{ ...word, index: i }],
        });
      } else {
        transcriptWordsGroupedBySpeaker[
          transcriptWordsGroupedBySpeaker.length - 1
        ].words.push({
          ...word,
          index: i,
        });
      }
    }

    return transcriptWordsGroupedBySpeaker;
  }
}
