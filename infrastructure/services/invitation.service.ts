import prisma from "@/lib/prisma";
import { Invitation, InvitationStatus, Role } from "@prisma/client";

export interface ICreateInvitationsPayload {
  email: string;
  role: Role;
}

export const getTeamNameAndMemberEmails = async (teamId: string) => {
  return await prisma.team.findUnique({
    where: {
      id: teamId,
    },
    select: {
      name: true,
      users: {
        select: {
          email: true,
        },
      },
    },
  });
};

export const createInvitations = async (
  invitations: ICreateInvitationsPayload[],
  invitedByUserId: string,
  teamId: string
) => {
  return await prisma.invitation.createMany({
    data: invitations.map((invitation) => ({
      invitedEmail: invitation.email,
      role: invitation.role,
      invitedByUserId,
      teamId,
    })),
    skipDuplicates: true,
  });
};

export const getInvitationById = async (
  invitationId: string
): Promise<Invitation | null> => {
  try {
    return prisma.invitation.findUnique({
      where: { id: invitationId },
    });
  } catch (error: any) {
    console.error("Error fetching invitation:", error);
    throw new Error(error.message);
  }
};

export const updateInvitationStatus = async (
  invitationId: string,
  status: InvitationStatus,
  invitedUserId?: string
): Promise<Invitation> => {
  try {
    return prisma.invitation.update({
      where: { id: invitationId },
      data: {
        status: status,
        ...(invitedUserId &&
          status === "ACCEPTED" && {
            invitedUser: {
              connect: { id: invitedUserId },
            },
          }),
      },
    });
  } catch (error: any) {
    console.error("Error updating invitation status:", error);
    throw new Error(error.message);
  }
};
