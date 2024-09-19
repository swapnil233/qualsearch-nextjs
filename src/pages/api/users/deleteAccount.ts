import { deleteUserAccount } from "@/infrastructure/services/user.service";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

// Define the schema for input validation using zod
const deleteAccountSchema = z.object({
  id: z.string().cuid(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE") {
    res.setHeader("Allow", ["DELETE"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    // Parse and validate the request body
    const { id } = deleteAccountSchema.parse(req.body);

    // Delete the user account
    await deleteUserAccount(id);

    return res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }

    return res.status(500).json({ error: "Failed to delete account" });
  }
}
