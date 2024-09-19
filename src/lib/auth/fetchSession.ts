import type { Session } from "next-auth";
import type { NextRequest } from "next/server";

export async function fetchSession(req: NextRequest): Promise<Session | null> {
  const url = new URL("/api/auth/session", req.url);
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      cookie: req.headers.get("cookie") || "",
    },
  });

  if (!response.ok) {
    console.error(`Failed to fetch session: ${response.statusText}`);
    return null;
  }

  return response.json() as Promise<Session>;
}
