import { sendVerificationEmail } from "@/infrastructure/services/email.service";
import { getUser } from "@/infrastructure/services/user.service";
import { createNewVerificationToken } from "@/infrastructure/services/verification.service";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const email = req.body.email as string;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await getUser({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.emailVerified) {
        return res
          .status(400)
          .json({ message: "Your email is already verified." });
      }

      const { token } = await createNewVerificationToken(user.email);
      await sendVerificationEmail(user.name || "User", user.email, token);

      return res.status(200).json({
        message: "Verification email sent. Please check your inbox.",
      });
    } catch (error) {
      console.error("API handler error:", error);
      if (error instanceof Error) {
        return res.status(500).json({
          message: error.message,
        });
      }
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
