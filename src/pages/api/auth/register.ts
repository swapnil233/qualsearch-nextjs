import { sendVerificationEmail } from "@/infrastructure/services/email.service";
import { createUserWithEmailAndPassword, getUser } from "@/infrastructure/services/user.service";
import { createNewVerificationToken } from "@/infrastructure/services/verification.service";
import { hash } from "bcrypt";
import { NextApiRequest, NextApiResponse } from "next";

const SALT_ROUNDS = 10;

export default async function register(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  // Validate the request body
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check if a user with the same email already exists
  const existingUser = await getUser({ email });
  if (existingUser) {
    return res
      .status(409)
      .send(
        "A user with this email address already exists. Please try another."
      );
  }

  // Hash the password
  const hashedPassword = await hash(password, SALT_ROUNDS);

  // Create a new user in the DB
  const user = await createUserWithEmailAndPassword(
    email,
    name,
    hashedPassword
  );

  // Create a new verification token in the DB
  const verificationToken = await createNewVerificationToken(user.email);

  // Send user a verification email
  await sendVerificationEmail(
    user.name || "User",
    user.email,
    verificationToken.token
  );

  return res.status(201).json({ message: "User created", user });
}
