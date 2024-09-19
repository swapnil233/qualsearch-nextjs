import { getUser, updateUser } from "@/infrastructure/services/user.service";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { compare, hash } from "bcrypt";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

// Define the schema for input validation using zod
const updatePasswordSchema = z.object({
  id: z.string().cuid(),
  currentPassword: z.string().min(8, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters long"),
});

const SALT_ROUNDS = 10;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Allow only PATCH requests
  if (req.method !== "PATCH") {
    res.setHeader("Allow", ["PATCH"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    // Parse and validate the request body
    const { id, currentPassword, newPassword } = updatePasswordSchema.parse(
      req.body
    );

    // Find the user
    const user = await getUser({ id });
    if (!user || !user.password) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if current password matches
    const isMatch = await compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    // Hash the new password
    const hashedPassword = await hash(newPassword, SALT_ROUNDS);

    // Update the password in the database
    const updatedUser = await updateUser(id, { password: hashedPassword });

    // Return the updated user data
    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating password:", error);

    // Validation errors
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }

    // Prisma errors
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return res.status(404).json({ error: "User not found" });
      }
    }

    // Generic errors
    return res.status(500).json({ error: "Failed to update password" });
  }
}
