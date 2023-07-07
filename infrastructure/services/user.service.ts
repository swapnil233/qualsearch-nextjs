import prisma from "@/utils/prisma";

/**
 * Updates the user's role.
 * 
 * @param userId ID of user, from session or DB
 * @param role The new role of the user. One of ROLE enum
 * @returns a promise resolving to the updated user
 */
export async function updateUserRole(userId: string, role: string) {
    try {
        return await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                role: role,
            },
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(`Error in updateUserRole: ${error.message}`);
        } else {
            console.error(`An unknown error occurred in updateUserRole`);
        }
        throw error;
    }
}