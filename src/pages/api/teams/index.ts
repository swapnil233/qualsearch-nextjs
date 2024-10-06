import {
  createTeam,
  deleteTeam,
  getTeamById,
  getTeamsByUser,
  validateUserIsTeamMember,
} from "@/infrastructure/services/team.service";
import { getCurrentUser } from "@/infrastructure/services/user.service";
import { ErrorMessages } from "@/lib/constants/ErrorMessages";
import { HttpStatus } from "@/lib/constants/HttpStatus";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession, Session } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res
      .status(HttpStatus.Unauthorized)
      .json({ error: ErrorMessages.Unauthorized });
  }

  switch (req.method) {
    case "POST":
      return handlePost(req, res, session);
    case "GET":
      return handleGet(req, res, session);
    case "DELETE":
      return handleDelete(req, res, session);
    default:
      res.setHeader("Allow", ["POST", "GET", "DELETE"]);
      return res
        .status(HttpStatus.MethodNotAllowed)
        .end(`Method ${req.method} Not Allowed`);
  }
}

async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
) {
  const { teamName, teamDescription } = req.body;

  if (!teamName) {
    return res
      .status(HttpStatus.BadRequest)
      .json({ error: ErrorMessages.BadRequest });
  }

  try {
    const userId = session.user.id;
    const team = await createTeam(teamName, teamDescription, userId);
    return res.status(HttpStatus.Ok).json({ data: team });
  } catch (error: any) {
    console.error(error);
    return res
      .status(HttpStatus.InternalServerError)
      .json({ error: ErrorMessages.InternalServerError });
  }
}

async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
) {
  const { teamId } = req.query;

  if (!teamId) {
    try {
      const user = await getCurrentUser(req, res);
      const teams = await getTeamsByUser(user.id);
      return res.status(HttpStatus.Ok).json({ data: teams });
    } catch (error: any) {
      console.error(error);
      return res
        .status(HttpStatus.InternalServerError)
        .json({ error: error.message });
    }
  }

  try {
    const userId = session.user.id;
    await validateUserIsTeamMember(teamId as string, userId);

    const team = await getTeamById(teamId as string);
    return res.status(HttpStatus.Ok).json({ data: team });
  } catch (error: any) {
    console.error(error);
    return res.status(HttpStatus.Unauthorized).json({ error: error.message });
  }
}

async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
) {
  const { teamId } = req.query;

  if (!teamId) {
    return res
      .status(HttpStatus.BadRequest)
      .json({ error: ErrorMessages.MissingTeamId });
  }

  try {
    const userId = session.user.id;
    await validateUserIsTeamMember(teamId as string, userId);
    await deleteTeam(teamId as string);
    return res
      .status(HttpStatus.Ok)
      .json({ message: "Team deleted successfully." });
  } catch (error: any) {
    console.error(error);
    return res
      .status(HttpStatus.InternalServerError)
      .json({ error: ErrorMessages.InternalServerError });
  }
}
