import prisma from "@/lib/prisma";
import { hash } from "bcrypt";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

const SALT_ROUNDS = 10;

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(6),
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
    const { token, password } = resetPasswordSchema.parse(req.body);

    const passwordResetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!passwordResetToken || passwordResetToken.expiresAt < new Date()) {
      return res
        .status(400)
        .json({ error: "Invalid or expired password reset token" });
    }

    const hashedPassword = await hash(password, SALT_ROUNDS);

    await prisma.user.update({
      where: { id: passwordResetToken.userId },
      data: { password: hashedPassword },
    });

    await prisma.passwordResetToken.delete({
      where: { id: passwordResetToken.id },
    });

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }

    return res.status(500).json({ error: "Failed to reset password" });
  }
}
