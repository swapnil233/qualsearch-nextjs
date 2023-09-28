import { Prisma, Team, User } from "@prisma/client";

export type TeamWithUsers = Team & {
  users: User[];
};

export type FileWithoutTranscriptAndUri = Prisma.FileGetPayload<{
  select: {
    id: true,
    name: true,
    description: true,
    createdAt: true,
    updatedAt: true,
    type: true,
    projectId: true,
    teamId: true,
    status: true,
    transcriptRequestId: {
      select: {
        request_id: true,
      },
    },
  },
}>;

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
  };
}>;

export type TagWithNotes = Prisma.TagGetPayload<{
  include: {
    notes: true,
  }
}>;

export type TagWithNotesAndURIs = Prisma.TagGetPayload<{
  include: {
    notes: {
      include: {
        file: {
          select: {
            uri: true,
            type: true
          },
        },
        createdBy: {
          select: {
            id: true;
            name: true;
            image: true;
          };
        }
      },
    },
  },
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
