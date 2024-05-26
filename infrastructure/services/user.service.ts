import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { User } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * Gets a user by their ID
 * @param id The ID of the user to retrieve
 * @returns The user with the given ID
 */
export const getUserById = async (id: string): Promise<User | null> => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    return user;
  } catch (error: any) {
    throw new Error(error);
  }
};

// Get current user from session
export const getCurrentUser = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const session = await getSession(req, res);

  if (!session) {
    throw new Error('Unauthorized');
  }

  return session.user;
};