import { IGroup, ITranscript } from "@/components/transcript/interfaces";

export class TranscriptGrouper {
  transcript: ITranscript[];

  constructor(transcript: ITranscript[]) {
    this.transcript = transcript;
  }

  groupBySpeaker(): IGroup[] {
    const groupedTranscript: IGroup[] = [];

    for (let i = 0; i < this.transcript.length; i++) {
      const word = this.transcript[i];
      if (
        groupedTranscript.length === 0 ||
        groupedTranscript[groupedTranscript.length - 1].speaker !== word.speaker
      ) {
        groupedTranscript.push({
          speaker: word.speaker,
          words: [{ ...word, index: i }],
        });
      } else {
        groupedTranscript[groupedTranscript.length - 1].words.push({
          ...word,
          index: i,
        });
      }
    }

    return groupedTranscript;
  }
}
