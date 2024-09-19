import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { User, UserPreferences } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

export const getCurrentUser = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const session = await getSession(req, res);

  if (!session) {
    throw new Error("Unauthorized");
  }

  return session.user;
};

export const getUser = async (
  key: { id: string } | { email: string }
): Promise<User | null> => {
  try {
    return await prisma.user.findUnique({
      where: key,
    });
  } catch (error) {
    console.error("Error fetching user", error);
    throw new Error("Error fetching user");
  }
};

export const getUserAccount = async (userId: string) => {
  try {
    return await prisma.account.findFirst({
      where: {
        userId,
      },
    });
  } catch (error) {
    console.error("Error fetching Account", error);
    throw new Error("Error fetching Account");
  }
};

export const getUserPreferences = async (
  userId: string
): Promise<UserPreferences | null> => {
  try {
    return await prisma.userPreferences.findUnique({
      where: {
        userId,
      },
    });
  } catch (error) {
    console.error("Error fetching user preferences", error);
    throw new Error("Error fetching user preferences");
  }
};

export async function createUserWithEmailAndPassword(
  email: string,
  name: string,
  hashedPassword: string
): Promise<User> {
  try {
    return await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        emailVerified: null,
        accounts: {
          create: {
            type: "credentials",
            provider: "email",
            providerAccountId: email,
          },
        },
        preferences: {
          create: {
            contactTimePreference: "MORNING",
            emailNotifications: true,
            pushNotifications: true,
            smsNotifications: true,
            darkMode: false, // You can customize default preferences here
            language: "en",
            newsletterSubscribed: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error creating user", error);
    throw new Error("Error creating user");
  }
}

export async function updateUser(
  userId: string,
  data: Partial<User>
): Promise<User> {
  if (!userId) {
    throw new Error("User ID is required");
  }

  if (Object.keys(data).length === 0) {
    throw new Error("No data provided for update");
  }

  try {
    return await prisma.user.update({
      where: {
        id: userId,
      },
      data,
    });
  } catch (error) {
    console.error("Error updating user", error);
    throw new Error("Error updating user");
  }
}

export async function updateUserPreferences(
  userId: string,
  preferencesData: Partial<UserPreferences>
): Promise<UserPreferences> {
  if (!userId) {
    throw new Error("User ID is required");
  }

  if (Object.keys(preferencesData).length === 0) {
    throw new Error("No data provided for update");
  }

  try {
    const updatedPreferences = await prisma.userPreferences.update({
      where: {
        userId: userId,
      },
      data: preferencesData,
    });
    return updatedPreferences;
  } catch (error) {
    console.error("Error updating user preferences", error);
    throw new Error("Error updating user preferences");
  }
}

export async function updateVerificationTokenAndEmail(
  userId: string,
  emailVerifiedDate: Date,
  newEmail: string
): Promise<User> {
  try {
    return await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        emailVerified: emailVerifiedDate,
        email: newEmail,
      },
    });
  } catch (error) {
    console.error("Error updating verification token and email", error);
    throw new Error("Error updating verification token and email");
  }
}

export async function deleteVerificationToken(tokenId: string) {
  try {
    return await prisma.verificationToken.delete({
      where: {
        id: tokenId,
      },
    });
  } catch (error) {
    console.error("Error deleting verification token", error);
    throw new Error("Error deleting verification token");
  }
}

export async function deleteUserAccount(userId: string) {
  try {
    await prisma.user.delete({
      where: {
        id: userId,
      },
    });
  } catch (error) {
    console.error("Error deleting user account", error);
    throw new Error("Error deleting user account");
  }
}

export async function createPasswordResetToken(data: {
  userId: string;
  token: string;
  expiresAt: Date;
}) {
  try {
    return await prisma.passwordResetToken.create({ data });
  } catch (error) {
    console.error("Error creating password reset token", error);
    throw new Error("Error creating password reset token");
  }
}

export async function deletePasswordResetToken(tokenId: string) {
  try {
    return await prisma.passwordResetToken.delete({
      where: {
        id: tokenId,
      },
    });
  } catch (error) {
    console.error("Error deleting password reset token", error);
    throw new Error("Error deleting password reset token");
  }
}
