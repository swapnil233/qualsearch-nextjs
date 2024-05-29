import { AuthenticationForm } from "@/components/auth/AuthenticationForm";
import SharedHead from "@/components/shared/SharedHead";
import { Stack, useMantineTheme } from "@mantine/core";
import { GetServerSidePropsContext } from "next";
import { Provider } from "next-auth/providers";
import { getCsrfToken, getProviders, getSession } from "next-auth/react";

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

interface IRegisterPage {
  providers: Provider[];
}

const RegisterPage: React.FC<IRegisterPage> = ({ providers }) => {
  const theme = useMantineTheme();
  return (
    <>
      <SharedHead title="Register" description="Register at QualSearch.io" />

      <Stack
        w={"100%"}
        h={"100vh"}
        justify="center"
        align="center"
        bg={theme.colors.dark[8]}
      >
        <AuthenticationForm providers={providers} type="register" />
      </Stack>
    </>
  );
};

export default RegisterPage;
