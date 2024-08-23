import SharedHead from "@/components/shared/SharedHead";
import { FC, ReactNode } from "react";
import Footer from "../../navigation/footer/Footer";
import Navbar from "../../navigation/navbar/Navbar";

export interface IHomePageLayout {
  children: ReactNode;
}

const HomePageLayout: FC<IHomePageLayout> = ({ children }) => {
  return (
    <>
      <SharedHead description="QualSearch.io" />
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
};

export default HomePageLayout;
