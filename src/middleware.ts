import micromatch from "micromatch";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { fetchSession } from "./lib/auth/fetchSession";

const protectedRoutes = [
  "/teams/**",
  //  "/api/users/**"
];

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check if the route requires authentication
  if (micromatch.isMatch(pathname, protectedRoutes)) {
    const redirectUrl = new URL("/signin", req.url);
    redirectUrl.searchParams.set("callbackUrl", encodeURI(req.url));

    try {
      const session = await fetchSession(req);

      if (!session?.user) {
        return NextResponse.redirect(redirectUrl);
      }

      if (!session.user.emailVerified) {
        const verifyEmailUrl = new URL("/verify-email", req.url);
        return NextResponse.redirect(verifyEmailUrl);
      }
    } catch (error) {
      console.error("Error during session fetch:", error);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth/session).*)"],
};
