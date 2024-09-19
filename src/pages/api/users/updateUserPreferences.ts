import { updateUserPreferences } from "@/infrastructure/services/user.service";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

// Define the enum for contact time preference
const ContactTimePreferenceEnum = z.enum(["MORNING", "AFTERNOON", "EVENING"]);

// Define the schema for input validation using zod
const updateUserPreferencesSchema = z.object({
  id: z.string().cuid(),
  emailNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  contactTimePreference: ContactTimePreferenceEnum.optional(),
  darkMode: z.boolean().optional(),
  language: z.string().optional(),
  newsletterSubscribed: z.boolean().optional(),
});

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
    const { id, ...preferencesData } =
      updateUserPreferencesSchema.parse(req.body);

    // Update the user preferences in the database
    const updatedPreferences = await updateUserPreferences(id, preferencesData);

    // Return the updated user preferences data
    return res.status(200).json(updatedPreferences);
  } catch (error) {
    console.error("Error updating user preferences:", error);

    // Validation errors
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }

    // Prisma errors
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return res.status(404).json({ error: "User preferences not found" });
      }
    }

    // Generic errors
    return res.status(500).json({ error: "Failed to update user preferences" });
  }
}
