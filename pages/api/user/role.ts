import prisma from "@/utils/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

// POST '/api/user/role'
export default async function Handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
        return res.status(401).send("Unauthorized");
    }

    if (req.method === "POST") {
        const { teamId, userId, role } = req.body;
        if (!userId || !role || !teamId) {
            return res.status(400).send("Missing data to update user role.");
        }

        // Make sure that the user who is making the request is part of the team
        const team = await prisma.team.findUnique({
            where: {
                id: teamId,
            },
            include: {
                users: true,
            }
        })

        if (!team) {
            return res.status(404).send("Team not found.");
        }

        // @ts-expect-error
        const user = team.users.find((user) => user.id === session.user?.id);
        if (!user) {
            return res.status(401).send("Unauthorized");
        }

        // Update the user's role
        try {
            const updateUserRole = await prisma.user.update({
                where: {
                    id: userId,
                },
                data: {
                    role: role,
                }
            })

            return res.status(200).send(updateUserRole);
        } catch (error) {
            console.log(error);
            res.status(500).send("Something went wrong.");
        }
    }
}