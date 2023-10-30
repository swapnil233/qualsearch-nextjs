import Head from "next/head";
import { FC, ReactNode } from "react";
import Footer from "../../navigation/footer/Footer";
import Navbar from "../../navigation/navbar/Navbar";

export interface IHomePageLayout {
  children: ReactNode;
}

const HomePageLayout: FC<IHomePageLayout> = ({ children }) => {
  return (
    <>
      <Head>
        <title>QualSearch</title>
        <meta charSet="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        <link
          rel="canonical"
          href="https://main.dvws5ww9zrzf5.amplifyapp.com"
        />
        <meta
          name="description"
          content="Steamlined UX Research With the Power of AI. Collaborate with your team to easily analyze user interviews using transcript tagging and AI powered insights."
        />
        <meta
          name="keywords"
          content="transcribe, diarize, CAQDAS, qualitative research, UX research analysis, UX research repository"
        />
        <meta name="author" content="Hasan Iqbal" />
        <meta name="copyright" content="QualSearch" />
      </Head>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
};

export default HomePageLayout;
