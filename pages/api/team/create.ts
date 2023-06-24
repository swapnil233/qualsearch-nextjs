import prisma from "@/utils/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

// POST '/api/team/create'
export default async function Handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
        return res.status(401).send("Unauthorized");
    }

    if (req.method === "POST") {
        const { teamName, teamDescription } = req.body;
        if (!teamName || !teamDescription) {
            return res.status(400).send("Missing team name or description.");
        }

        try {
            const team = await prisma.team.create({
                data: {
                    name: teamName,
                    description: teamDescription,
                    // @ts-expect-error
                    createdByUserId: session.user.id,
                    users: {
                        connect: {
                            // @ts-expect-error
                            id: session.user.id,
                        },
                    },
                },
                include: {
                    users: true,
                }
            })

            return res.status(200).send(team);
        } catch (error) {
            console.log(error);
            res.status(500).send("Something went wrong.");
        }
    }
}