import { Team, User } from "@prisma/client";

export type TeamWithUsers = Team & {
    users: User[];
};