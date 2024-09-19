import { sendVerificationEmail } from "@/infrastructure/services/email.service";
import { getUser } from "@/infrastructure/services/user.service";
import { createNewVerificationToken } from "@/infrastructure/services/verification.service";
import getGoogleCredentials from "@/lib/auth/getGoogleCredentials";
import prisma from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcrypt";
import NextAuth, { NextAuthOptions, Session } from "next-auth";
import type { Adapter } from "next-auth/adapters";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  secret: process.env.JWT_SECRET ?? "secret",
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 14, // 14 days
    updateAge: 60 * 60 * 12, // 12 hours
  },
  providers: [
    GoogleProvider({
      clientId: getGoogleCredentials().clientId,
      clientSecret: getGoogleCredentials().clientSecret,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        if (!credentials) {
          throw new Error("No credentials provided");
        }

        const { email, password } = credentials;
        if (!email || !password) {
          throw new Error("Email and password are required");
        }

        const user = await getUser({ email });
        if (!user) throw new Error("Invalid credentials");

        const isValid = await compare(password, user.password || "");

        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          emailVerified: user.emailVerified,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.emailVerified = (user as any).emailVerified;
      } else if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { emailVerified: true },
        });
        token.emailVerified = dbUser?.emailVerified;
      }
      return token;
    },

    // Called whenever a session is checked.
    // When using JWTs, the jwt() callback is invoked before this session() callback,
    // so anything added to the JWT in jwt() will be available in session().
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token && typeof token.id === "string") {
        session.user = {
          id: token.id,
          name: token.name || null,
          email: token.email || null,
          image: token.picture || null,
          emailVerified: token.emailVerified
            ? new Date(token.emailVerified as string)
            : null,
        };
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (user.email && !user.emailVerified) {
        const verificationToken = await createNewVerificationToken(user.email);
        await sendVerificationEmail(
          user.name || "User",
          user.email,
          verificationToken.token
        );
      }

      await prisma.userPreferences.create({
        data: {
          contactTimePreference: "MORNING",
          emailNotifications: true,
          pushNotifications: true,
          smsNotifications: true,
          darkMode: false,
          userId: user.id,
        },
      });
    },
  },

  pages: {
    signIn: "/signin",
  },
};

export default NextAuth(authOptions);
export const config = authOptions;
