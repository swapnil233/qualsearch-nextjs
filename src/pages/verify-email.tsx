import SharedHead from "@/components/shared/SharedHead";
import { sendWelcomeEmail } from "@/infrastructure/services/email.service";
import {
  deleteVerificationToken,
  getUser,
  updateVerificationTokenAndEmail,
} from "@/infrastructure/services/user.service";
import { getVerificationToken } from "@/infrastructure/services/verification.service";
import app from "@/lib/app";
import { auth } from "@/lib/auth/auth";
import { host } from "@/lib/host";
import { Button, Card, Group, Stack, Text, Title } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { GetServerSidePropsContext } from "next";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { FC, useEffect, useState } from "react";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await auth(context.req, context.res);
  const token = context.query.token as string;

  // Check if the user is authenticated and has an email
  if (!session || !session.user.email) {
    const redirectUrl = new URL(`${host}/signin`);
    redirectUrl.searchParams.set(
      "callbackUrl",
      encodeURI(context.req.url as string)
    );

    return {
      redirect: {
        destination: redirectUrl.toString(),
        permanent: false,
      },
    };
  }

  // Redirect if the user is already verified.
  if (session.user.emailVerified) {
    return {
      redirect: {
        destination: "/teams",
        permanent: false,
      },
    };
  }

  // Check for a verification token in the query parameters
  if (!token) {
    const pendingToken = await getVerificationToken({
      email: session.user.email,
    });
    return {
      props: {
        message: pendingToken
          ? "Check your email for the verification link. If you didn't receive it, you can resend the verification email."
          : `You must verify your email to access ${app.name}. Please send a verification email.`,
      },
    };
  }

  // Handle the token validation and email verification process
  try {
    const existingToken = await getVerificationToken({ token });

    // Non-existent token
    if (!existingToken) {
      throw new Error(
        "The email address or the token you are trying to verify does not exist."
      );
    }

    // Expired token
    const tokenHasExpired = new Date(existingToken.expires) < new Date();
    if (tokenHasExpired) {
      throw new Error("This link has expired.");
    }

    // User's email has changed
    const tokenUser = await getUser({ email: existingToken.email });
    if (!tokenUser) {
      throw new Error("User doesn't exist");
    }

    // Verify email and update user information
    await updateVerificationTokenAndEmail(
      tokenUser.id,
      new Date(),
      existingToken.email
    );

    // Send user a welcome email
    await sendWelcomeEmail(tokenUser.name || "User", tokenUser.email);

    // Delete the token
    await deleteVerificationToken(existingToken.id);

    return {
      props: {
        success: true,
        message:
          "Your email has been verified! Please proceed to the dashboard.",
      },
    };
  } catch (error) {
    return {
      props: {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong on our end. Please try again later...",
      },
    };
  }
}

interface IVerifyEmailPage {
  success?: boolean;
  message?: string;
}

const VerifyEmailPage: FC<IVerifyEmailPage> = ({ success, message }) => {
  const session = useSession();
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState<number | null>(null);

  useEffect(() => {
    const fetchCooldown = async () => {
      if (session.data?.user.email) {
        try {
          const response = await fetch(
            `/api/cooldown?email=${session.data.user.email}`
          );
          const data = await response.json();
          if (response.ok) {
            setCooldown(data.cooldown);
          } else {
            showNotification({
              title: "Error",
              message: data.message,
              color: "red",
            });
          }
        } catch (error) {
          console.error(error);
          showNotification({
            title: "Error",
            message: "Failed to fetch cooldown status.",
            color: "red",
          });
        }
      }
    };

    fetchCooldown();
  }, [session.data?.user.email]);

  useEffect(() => {
    if (cooldown !== null) {
      const interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev && prev > 1000) {
            return prev - 1000;
          }
          clearInterval(interval);
          return null;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [cooldown]);

  const resendVerificationEmail = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/users/verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: session.data?.user.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        showNotification({
          title: "Error",
          message: data.message,
          color: "red",
        });
      } else {
        showNotification({
          title: "Email sent",
          message: "Please check your email for a verification link.",
          color: "green",
        });
        setCooldown(5 * 60 * 1000); // 5 minutes cooldown
      }
    } catch (error) {
      console.error(error);
      showNotification({
        title: "Error",
        message: "Failed to send verification email.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SharedHead
        title="Verify email"
        description="Verify your email address."
      />
      <Group p="md" justify="space-between" align="center" h="100%">
        <Link href="/">
          <Title order={3}>{app.name}</Title>
        </Link>
        <Button
          size="sm"
          onClick={() =>
            signOut({
              redirect: true,
              callbackUrl: "/",
            })
          }
        >
          Sign Out
        </Button>
      </Group>
      <Stack h="100vh" w="95%" align="center" justify="center" m="0 auto">
        <Card p={"md"} shadow="sm" withBorder maw={600} aria-live="polite">
          <Stack>
            <Title order={2}>
              {success ? "Success!" : "Verify your email"}
            </Title>
            <Text size="lg">{message}</Text>
            {success ? (
              <Button size="lg" component={Link} href="/teams">
                Proceed to dashboard
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={resendVerificationEmail}
                loading={loading}
                disabled={cooldown !== null}
              >
                {cooldown !== null
                  ? `Please wait ${
                      cooldown > 60000
                        ? `${Math.ceil(cooldown / 1000 / 60)} min`
                        : `${Math.ceil(cooldown / 1000)} sec`
                    }`
                  : "Send verification email"}
              </Button>
            )}
          </Stack>
        </Card>
      </Stack>
    </>
  );
};

export default VerifyEmailPage;
