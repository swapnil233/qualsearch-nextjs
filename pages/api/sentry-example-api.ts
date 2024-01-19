import { NextApiRequest, NextApiResponse } from "next";

// A faulty API route to test Sentry's error monitoring
export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ name: "John Doe" });
  throw new Error("Sentry Example API Route Error");
}
