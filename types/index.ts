import { Prisma, Team, User } from "@prisma/client";
import { Document } from "langchain/document";

export type TeamWithUsers = Team & {
  users: User[];
};

export type FileWithoutTranscriptAndUri = Prisma.FileGetPayload<{
  select: {
    id: true;
    name: true;
    description: true;
    createdAt: true;
    updatedAt: true;
    type: true;
    projectId: true;
    teamId: true;
    status: true;
    participantName: true;
    participantOrganization: true;
    dateConducted: true;
    transcriptRequestId: {
      select: {
        request_id: true;
      };
    };
  };
}>;

export type TranscriptWord = {
  end: number;
  word: string;
  start: number;
  speaker: number;
  confidence: number;
  punctuated_word: string;
  speaker_confidence: number;
};

export type NoteWithTagsAndCreator = Prisma.NoteGetPayload<{
  include: {
    createdBy: {
      select: {
        id: true;
        name: true;
        image: true;
      };
    };
    tags: true;
    file: {
      select: {
        participantName: true;
        participantOrganization: true;
        dateConducted: true;
      };
    };
  };
}>;

export type TagWithNotes = Prisma.TagGetPayload<{
  include: {
    notes: true;
  };
}>;

export type TagWithNotesAndURIs = Prisma.TagGetPayload<{
  include: {
    notes: {
      include: {
        file: {
          select: {
            uri: true;
            type: true;
          };
        };
        createdBy: {
          select: {
            id: true;
            name: true;
            image: true;
          };
        };
      };
    };
  };
}>;

export type TagWithNoteIds = Prisma.TagGetPayload<{
  include: {
    createdBy: {
      select: {
        id: true;
      };
    };
    notes: {
      select: {
        id: true;
      };
    };
  };
}>;

export type Sentence = {
  start: number;
  end: number;
  text: string;
};

export type TranscriptParagraph = {
  start: number;
  end: number;
  speaker: number;
  num_words: number;
  sentences: Sentence[];
};

// 'paragraphs' is an array of TranscriptParagraph the entire transcript as a string
export type TranscriptParagraphs = {
  paragraphs: TranscriptParagraph[];
  transcript: string;
};

export type CleanedParagraph = {
  speaker: number;
  sentences: string; // Sentences are combined into a single string
};

export type PrismaTranscript = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  confidence: number;
  words: TranscriptWord[];
  paragraphs: TranscriptParagraph[];
  transcriptString: string;
  fileId: string;
  summaryId: string;
};

export type Message = {
  type: "apiMessage" | "userMessage";
  message: string;
  isStreaming?: boolean;
  sourceDocs?: Document[];
};

export interface UserMessage {
  type: "userMessage";
  message: string;
}

export interface ApiMessage {
  type: "apiMessage";
  message: string;
  sourceDocs?: Document[];
}

export interface IMessageState {
  messages: Message[];
  history: [string, string][];
  pendingSourceDocs?: Document[];
}
