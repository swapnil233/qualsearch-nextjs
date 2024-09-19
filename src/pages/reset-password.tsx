import ExpiredPasswordResetLink from "@/components/auth/ExpiredPasswordResetLink";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import SharedHead from "@/components/shared/SharedHead";
import app from "@/lib/app";
import { Stack } from "@mantine/core";
import { useRouter } from "next/router";
import { FC } from "react";

const ResetPasswordPage: FC = () => {
  const router = useRouter();
  const { token } = router.query;

  return (
    <>
      <SharedHead
        title="Reset password"
        description={`Reset your password for ${app.name}`}
      />
      <Stack justify="center" align="center">
        {!token ? (
          <ExpiredPasswordResetLink />
        ) : (
          <ResetPasswordForm token={token as string} />
        )}
      </Stack>
    </>
  );
};

export default ResetPasswordPage;
