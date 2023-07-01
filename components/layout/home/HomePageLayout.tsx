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
        <title>Transcription</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <meta name="description" content="Transcribe videos" />
        <meta name="keywords" content="transcribe, diarize" />
        <meta name="author" content="Hasan Iqbal" />
      </Head>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
};

export default HomePageLayout;
