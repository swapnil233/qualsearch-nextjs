import { AuthenticationForm } from "@/components/auth/AuthenticationForm";
import { Stack, useMantineTheme } from "@mantine/core";
import { GetServerSidePropsContext } from "next";
import { Provider } from "next-auth/providers";
import { getCsrfToken, getProviders, getSession } from "next-auth/react";
import Head from "next/head";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { req } = context;
  const session = await getSession({ req });

  if (session) {
    return {
      redirect: { destination: "/" },
    };
  }

  return {
    props: {
      providers: await getProviders(),
      csrfToken: await getCsrfToken(context),
    },
  };
}

interface ISignInPage {
  providers: Provider[];
}

const SignInPage: React.FC<ISignInPage> = ({ providers }) => {
  const theme = useMantineTheme();
  return (
    <>
      <Head>
        <title>{`Sign In | QualSearch`}</title>
        <meta
          name="viewport"
          content="width=device-width, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"
        ></meta>
        <meta name="description" content="Sign in to QualSearch.io" />

        <meta property="og:title" content={`Sign In | QualSearch`} />
        <meta property="og:description" content="Sign in to QualSearch.io" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="QualSearch" />
      </Head>

      <Stack
        w={"100%"}
        h={"100vh"}
        justify="center"
        align="center"
        bg={theme.colors.dark[8]}
      >
        <AuthenticationForm providers={providers} />
      </Stack>
    </>
  );
};

export default SignInPage;
