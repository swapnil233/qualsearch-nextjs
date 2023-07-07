import { ErrorMessages } from "@/constants/ErrorMessages";
import prisma from "@/utils/prisma";
import { Project, Team, User } from "@prisma/client";

/**
 * Validate inputs for creating or updating a team.
 * Throws an error if validation fails.
 *
 * @param teamName The name of the team.
 * @param teamDescription The description of the team.
 * @throws Will throw an error if validation fails.
 * @returns void
 */
function validateTeamInputs(teamName: string, teamDescription: string): void {
  if (!teamName || teamName.length > 255) {
    throw new Error(
      "Team name must be provided and be less than 256 characters."
    );
  }

  if (teamDescription && teamDescription.length > 500) {
    throw new Error("Team description must be less than 500 characters.");
  }
}

/**
 * Creates a team given a name, description, and the ID of the user creating the team.
 *
 * @param teamName The name of the team.
 * @param teamDescription The description of the team.
 * @param userId The ID of the user creating the team.
 * @throws Will throw an error if the Prisma query fails.
 * @returns A Promise resolving to the created team and its users.
 */
export async function createTeam(
  teamName: string,
  teamDescription: string,
  userId: string
): Promise<Team & { users: User[] }> {
  validateTeamInputs(teamName, teamDescription);

  try {
    return await prisma.team.create({
      data: {
        name: teamName,
        description: teamDescription,
        createdByUserId: userId,
        users: {
          connect: {
            id: userId,
          },
        },
      },
      include: {
        users: true,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error in createTeam: ${error.message}`);
    } else {
      console.error(`An unknown error occurred in createTeam`);
    }
    throw error;
  }
}

/**
 * Updates a team.
 *
 * @param teamId The ID of the team to update.
 * @param input An object containing the team name and description.
 * @param input.teamName The name of the team.
 * @param input.teamDescription The description of the team.
 * @returns A Promise resolving to the updated team.
 * @throws Will throw an error if the Prisma query fails.
 */
export async function updateTeam(
  teamId: string,
  input: {
    teamName: string;
    teamDescription: string;
  }
): Promise<Team & { users: User[]; projects: Project[] }> {
  validateTeamInputs(input.teamName, input.teamDescription);

  try {
    return await prisma.team.update({
      where: { id: teamId },
      data: {
        name: input.teamName,
        description: input.teamDescription,
      },
      include: { users: true, projects: true },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error in updateTeam: ${error.message}`);
    } else {
      console.error(`An unknown error occurred in updateTeam`);
    }
    throw error;
  }
}

/**
 * Retrieves a team by its ID.
 *
 * @param teamId The ID of the team to retrieve.
 * @returns A Promise resolving to the team, including its users and projects, or null if not found.
 * @throws Will throw an error if the Prisma query fails.
 */
export async function getTeamAndUsersAndProjectsByTeamId(
  teamId: string
): Promise<(Team & { users: User[]; projects: Project[] }) | null> {
  try {
    return await prisma.team.findUnique({
      where: { id: teamId },
      include: { users: true, projects: true },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(
        `Error in getTeamAndUsersAndProjectsByTeamId: ${error.message}`
      );
    } else {
      console.error(
        `An unknown error occurred in getTeamAndUsersAndProjectsByTeamId`
      );
    }
    throw error;
  }
}

/**
 * Retrieves a team and its users by the team ID.
 *
 * @param teamId The team ID
 * @returns A promise resolving to the team and its users or null
 */
export async function getTeamAndUsersByTeamId(
  teamId: string
): Promise<(Team & { users: User[] }) | null> {
  try {
    const team = await prisma.team.findUnique({
      where: {
        id: teamId,
      },
      include: {
        users: true,
      },
    });

    if (!team) {
      console.error(`No team found for id: ${teamId}`);
      return null;
    }

    return team;
  } catch (error) {
    console.error(`Failed to fetch team for id: ${teamId}`, error);
    return null;
  }
}

/**
 * Retrieves a team by its ID.
 *
 * @param teamId The ID of the team to retrieve.
 * @returns A Promise resolving to the team, or null if not found.
 */
export async function getTeamById(teamId: string): Promise<Team | null> {
  try {
    return await prisma.team.findUnique({
      where: {
        id: teamId,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error in getTeamById: ${error.message}`);
    } else {
      console.error(`An unknown error occurred in getTeamById`);
    }
    throw error;
  }
}

/**
 * Retrieves all teams that a user is a part of.
 *
 * @param userId The ID of the user.
 * @param orderBy "asc" or "desc"
 * @returns A Promise resolving to the list of teams.
 */
export async function getTeamsByUser(
  userId: string,
  orderBy: "desc" | "asc"
): Promise<Team[]> {
  try {
    return await prisma.team.findMany({
      where: {
        users: {
          some: {
            id: userId,
          },
        },
      },
      include: {
        users: true,
      },
      orderBy: {
        updatedAt: orderBy,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error in getTeamsByUser: ${error.message}`);
    } else {
      console.error(`An unknown error occurred in getTeamsByUser`);
    }
    throw error;
  }
}

/**
 * Adds a user to a team.
 *
 * @param teamId The ID of the team.
 * @param userId The ID of the user.
 * @returns A Promise resolving to the updated team and its users.
 */
export async function addUserToTeam(
  teamId: string,
  userId: string
): Promise<Team & { users: User[] }> {
  try {
    return await prisma.team.update({
      where: { id: teamId },
      data: {
        users: {
          connect: {
            id: userId,
          },
        },
      },
      include: { users: true },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error in addUserToTeam: ${error.message}`);
    } else {
      console.error(`An unknown error occurred in addUserToTeam`);
    }
    throw error;
  }
}

/**
 * Removes a user from a team.
 *
 * @param teamId The ID of the team.
 * @param userId The ID of the user to remove.
 * @returns A Promise resolving to the updated team.
 */
export async function removeUserFromTeam(
  teamId: string,
  userId: string
): Promise<Team & { users: User[] }> {
  try {
    return await prisma.team.update({
      where: { id: teamId },
      data: {
        users: {
          disconnect: {
            id: userId,
          },
        },
      },
      include: { users: true },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error in removeUserFromTeam: ${error.message}`);
    } else {
      console.error(`An unknown error occurred in removeUserFromTeam`);
    }
    throw error;
  }
}

/**
 * Validates that a user is a member of a team.
 * Throws an error if validation fails.
 *
 * @param teamId The ID of the team.
 * @param userId The ID of the user.
 * @returns A Promise resolving to the updated team.
 */
export async function validateUserIsTeamMember(
  teamId: string,
  userId: string
): Promise<Team & { users: User[] }> {
  try {
    // Get the team and its users.
    const team = await getTeamAndUsersByTeamId(teamId);

    // If the team doesn't exist, throw an error.
    if (!team) {
      throw new Error("Team not found");
    }

    // If the user is not a member of the team, throw an error.
    const isMember = team.users.some((user) => user.id === userId);
    if (!isMember) {
      throw new Error(ErrorMessages.Unauthorized);
    }

    return team;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error in validateUserIsTeamMember: ${error.message}`);
    } else {
      console.error(`An unknown error occurred in validateUserIsTeamMember`);
    }
    throw error;
  }
}

/**
 * Get the ID of the team a project is in
 *
 * @param projectId string; The project ID
 * @returns A promise resolving to the team ID or null
 * @throws Will throw an error if the Prisma query fails.
 */
export async function getTeamIdFromProjectId(
  projectId: string
): Promise<string | null> {
  try {
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
      select: {
        teamId: true,
      },
    });

    if (!project) {
      console.error(`No project found for id: ${projectId}`);
      return null;
    }

    return project.teamId;
  } catch (error) {
    console.error(`Failed to fetch project for id: ${projectId}`, error);
    return null;
  }
}
