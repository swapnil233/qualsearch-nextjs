import { File, Team, User } from "@prisma/client";
import { GetResult } from "@prisma/client/runtime/library";

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

export type NotesAndUsers = ({
  createdBy: {
    id: string;
    name: string | null;
    image: string | null;
  };
} & GetResult<{
  id: string;
  createdAt: Date;
  updatedAt: Date;
  text: string;
  start: number;
  end: number;
  fileId: string;
  projectId: string;
  createdByUserId: string;
}, any> & {})