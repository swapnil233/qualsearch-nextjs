import prisma from "@/utils/prisma";
import { User } from "@prisma/client";

/**
 * Gets a user by their ID
 * @param id The ID of the user to retrieve
 * @returns The user with the given ID
 */
export const getUserById = async (id: string): Promise<User | null> => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: id
            }
        });

        return user;
    } catch (error: any) {
        throw new Error(error);
    }
}