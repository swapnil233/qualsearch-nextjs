import { ErrorMessages } from "@/constants/ErrorMessages";
import { HttpStatus } from "@/constants/HttpStatus";
import { validateUserIsTeamMember } from "@/infrastructure/services/team.service";
import { updateUserRole } from "@/infrastructure/services/user.service";
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
      return res.status(HttpStatus.BadRequest).send(ErrorMessages.BadRequest);
    }

    try {
      // Make sure that the user who is making the request is part of the team
      // @ts-ignore
      await validateUserIsTeamMember(teamId, session.user?.id);

      // Update the user's role
      const updatedUser = await updateUserRole(userId, role);

      return res.status(HttpStatus.Ok).send(updatedUser);
    } catch (error) {
      console.error(error);
      res.status(HttpStatus.InternalServerError).send(ErrorMessages.InternalServerError);
    }
  } else {
    // Handle non-POST requests
    res.status(HttpStatus.MethodNotAllowed).send(ErrorMessages.MethodNotAllowed);
  }
}