import { RegistrationForm } from "@/components/auth/RegistrationForm";
import QuotesCard from "@/components/card/quotes/QuotesCard";
import SharedHead from "@/components/shared/SharedHead";
import app from "@/lib/app";
import { auth } from "@/lib/auth/auth";
import { GetServerSidePropsContext } from "next";
import { Provider } from "next-auth/providers/index";
import { getProviders } from "next-auth/react";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await auth(context.req, context.res);

  if (session) {
    return {
      redirect: {
        destination: "/teams",
        permanent: false,
      },
    };
  }

  try {
    const providers = await getProviders();

    return {
      props: {
        providers,
      },
    };
  } catch (error) {
    return {
      redirect: { destination: "/" },
    };
  }
}

interface IRegisterPage {
  providers: Provider[];
}

const RegisterPage: React.FC<IRegisterPage> = ({ providers }) => {
  return (
    <>
      <SharedHead
        title="Register"
        description={`Register an account for ${app.name}`}
      />
      <div className="flex md:h-screen">
        <div
          className="hidden md:flex md:justify-center md:content-center md:items-center w-[46%] bg-cover bg-center"
          style={{ backgroundImage: "url('/register-half.jpeg')" }}
        >
          <QuotesCard />
        </div>
        <div className="w-full md:w-[54%] flex items-center justify-center">
          <RegistrationForm providers={providers} />
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
