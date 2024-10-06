import { sendPasswordResetEmail } from "@/infrastructure/services/email.service";
import {
  createPasswordResetToken,
  deletePasswordResetToken,
  getUser,
  getUserAccount,
} from "@/infrastructure/services/user.service";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

const prisma = new PrismaClient();
const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

const requestPasswordResetSchema = z.object({
  email: z.string().email(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { email } = requestPasswordResetSchema.parse(req.body);

    const user = await getUser({ email });

    if (!user) {
      console.error(`User with email ${email} not found`);
      return res.status(404).json({ error: "User not found" });
    }

    const account = await getUserAccount(user.id);

    if (!account) {
      console.error(`User with email ${email} has no associated account`);
      return res.status(404).json({ error: "User not found" });
    }

    if (account?.type === "oauth") {
      return res.status(400).json({
        error: `You cannot reset your password if you registered via ${
          account.provider.charAt(0).toUpperCase() + account.provider.slice(1)
        }. If you no longer have access to your account, please contact support.`,
      });
    }

    const existingToken = await prisma.passwordResetToken.findFirst({
      where: { userId: user.id },
    });

    const now = new Date();

    if (existingToken) {
      const timeSinceLastSent =
        now.getTime() - new Date(existingToken.createdAt).getTime();

      if (timeSinceLastSent < RESET_TOKEN_EXPIRY_MS) {
        return res.status(429).json({
          error: `Please wait ${Math.ceil(
            (RESET_TOKEN_EXPIRY_MS - timeSinceLastSent) / 1000 / 60
          )} minutes before requesting another password reset.`,
        });
      }

      await deletePasswordResetToken(existingToken.id);
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(now.getTime() + RESET_TOKEN_EXPIRY_MS);

    await createPasswordResetToken({ userId: user.id, token, expiresAt });

    await sendPasswordResetEmail(user.email, user.name, token);

    return res
      .status(200)
      .json({ message: "Password reset email sent. Please check your inbox." });
  } catch (error) {
    console.error("Error requesting password reset:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }

    return res.status(500).json({ error: "Failed to request password reset" });
  }
}
