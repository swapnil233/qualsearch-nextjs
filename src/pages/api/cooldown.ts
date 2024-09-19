import { getVerificationToken } from "@/infrastructure/services/verification.service";
import { NextApiRequest, NextApiResponse } from "next";

const COOLDOWN_PERIOD_MS = 5 * 60 * 1000; // 5 minutes

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const email = req.query.email as string;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const existingToken = await getVerificationToken({ email });

      if (existingToken) {
        const now = new Date();
        const timeSinceLastSent =
          now.getTime() - new Date(existingToken.lastSent).getTime();

        if (timeSinceLastSent < COOLDOWN_PERIOD_MS) {
          return res.status(200).json({
            cooldown: COOLDOWN_PERIOD_MS - timeSinceLastSent,
          });
        }
      }

      return res.status(200).json({ cooldown: 0 });
    } catch (error) {
      console.error("API handler error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
