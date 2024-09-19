import prisma from "@/lib/prisma";
import { VerificationToken } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const COOLDOWN_PERIOD_MS = 5 * 60 * 1000; // 5 minutes

export async function getVerificationToken(
  key: { id: string } | { email: string } | { token: string }
): Promise<VerificationToken | null> {
  try {
    return await prisma.verificationToken.findFirst({
      where: key,
    });
  } catch (error) {
    console.log("Error on getVerificationToken service", error);
    throw new Error("Error retrieving token in getVerificationToken service");
  }
}

export async function createNewVerificationToken(
  email: string
): Promise<VerificationToken> {
  try {
    const existingToken = await getVerificationToken({ email });
    const now = new Date();

    if (existingToken) {
      const timeSinceLastSent =
        now.getTime() - new Date(existingToken.lastSent).getTime();

      if (timeSinceLastSent < COOLDOWN_PERIOD_MS) {
        throw new Error(
          `Please wait ${Math.ceil(
            (COOLDOWN_PERIOD_MS - timeSinceLastSent) / 1000 / 60
          )} minutes before requesting another verification email.`
        );
      }

      await prisma.verificationToken.delete({
        where: {
          id: existingToken.id,
        },
      });
    }

    const token = uuidv4();
    const expires = new Date(now.getTime() + 3600 * 1000); // One hour

    return await prisma.verificationToken.create({
      data: {
        email,
        token,
        expires,
        lastSent: now,
      },
    });
  } catch (error) {
    console.log(error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error("Unexpected error");
  }
}
