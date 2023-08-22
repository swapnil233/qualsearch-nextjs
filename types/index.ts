import { File, Team, User } from "@prisma/client";

export type TeamWithUsers = Team & {
  users: User[];
};

export type FileWithoutTranscriptAndUri = Omit<File, "transcript" | "uri">;

export type Paragraph = {
  end?: number;
  start?: number;
  speaker: number;
  num_words?: number;
  sentences: Array<{ end?: number; text: string; start?: number }>;
};

export type Transcript = {
  start: number;
  end: number;
  speaker: number;
  punctuated_word: string;
}[];
