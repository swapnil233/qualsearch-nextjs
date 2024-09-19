import { LoginForm } from "@/components/auth/LoginForm";
import SharedHead from "@/components/shared/SharedHead";
import app from "@/lib/app";
import { auth } from "@/lib/auth/auth";
import { Stack } from "@mantine/core";
import { GetServerSidePropsContext } from "next";
import { Provider } from "next-auth/providers/index";
import { getProviders } from "next-auth/react";
import { useRouter } from "next/router";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await auth(context.req, context.res);
  if (session) {
    return {
      redirect: {
        destination: context.query.callbackUrl || "teams",
        permanent: false,
      },
    };
  }

  try {
    return {
      props: {
        providers: await getProviders(),
      },
    };
  } catch (error) {
    return {
      redirect: { destination: "/" },
    };
  }
}

interface ISignInPage {
  providers: Provider[];
}

const SignInPage: React.FC<ISignInPage> = ({ providers }) => {
  const router = useRouter();
  const callbackUrl = router.query.callbackUrl as string;

  return (
    <>
      <SharedHead title="Sign in" description={`Sign into ${app.name}`} />
      <Stack justify="center" align="center">
        <LoginForm providers={providers} callbackUrl={callbackUrl} />
      </Stack>
    </>
  );
};

export default SignInPage;
