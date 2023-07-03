import { File, Team, User } from "@prisma/client";

export type TeamWithUsers = Team & {
    users: User[];
};

export type FileWithoutTranscriptAndUri = Omit<File, "transcript" | "uri">;