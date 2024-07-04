import Dots from "@/components/landing/Dots";
import { Hero } from "@/components/landing/Hero";
import HomePageLayout from "@/components/layout/home/HomePageLayout";
import { NextPageWithLayout } from "@/pages/page";
import { Image, useMantineColorScheme } from "@mantine/core";

const QualSearch: NextPageWithLayout = () => {
  const { colorScheme } = useMantineColorScheme();

  const demoImage =
    colorScheme === "dark"
      ? "/demo-dark-no-border.png"
      : "/demo-light-no-border.png";

  return (
    <>
      <div className="relative pt-32 pb-20 lg:pt-28 lg:pb-16">
        <Dots
          className="absolute text-gray-100 dark:text-gray-700"
          style={{ left: 60, top: 0 }}
        />
        <Dots
          className="absolute text-gray-100 dark:text-gray-700"
          style={{ left: 0, top: 140 }}
        />
        <Dots
          className="absolute text-gray-100 dark:text-gray-700"
          style={{ right: 0, top: 60 }}
        />

        <Hero />

        <div className="flex justify-center mt-16 w-full lg:w-3/4 mx-auto lg:mt-12">
          <Image src={demoImage} alt="Demo image" />
        </div>
      </div>
    </>
  );
};

export default QualSearch;
QualSearch.getLayout = (page) => {
  return <HomePageLayout>{page}</HomePageLayout>;
};
