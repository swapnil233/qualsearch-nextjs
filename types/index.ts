import { Prisma, Team, User } from "@prisma/client";

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

export type Transcript = {
  start: number;
  end: number;
  speaker: number;
  punctuated_word: string;
}[];

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

export type TranscriptWords = {
  start: number;
  end: number;
  word: string;
  punctuated_word: string;
  confidence: number;
  speaker: number;
  speaker_confidence: number;
}[];

export type Sentence = {
  start: number;
  end: number;
  text: string;
}

export type TranscriptParagraph = {
  start: number;
  end: number;
  speaker: number;
  num_words: number;
  sentences: Sentence[];
};

export type TranscriptParagraphs = {
  paragraphs: TranscriptParagraph[];
  transcript: string;
};

export type CleanedParagraph = {
  speaker: number;
  sentences: string; // Sentences are combined into a single string
};