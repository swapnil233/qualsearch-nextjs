import prisma from "@/utils/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

// POST '/api/project/create'
export default async function Handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
        return res.status(401).send("Unauthorized");
    }

    if (req.method === "POST") {
        const { projectName, projectDescription, teamId } = req.body;

        if (!projectName || !projectDescription) {
            return res.status(400).send("Missing team name or description.");
        }

        if (!teamId) {
            return res.status(400).send("Missing team id.");
        }

        try {
            const team = await prisma.project.create({
                data: {
                    name: projectName,
                    description: projectDescription,
                    teamId: teamId,
                },
            })

            return res.status(200).send(team);
        } catch (error) {
            console.log(error);
            res.status(500).send("Something went wrong.");
        }
    }
}