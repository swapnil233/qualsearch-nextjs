import Dots from "@/components/landing/Dots";
import { Hero } from "@/components/landing/Hero";
import HomePageLayout from "@/components/layout/home/HomePageLayout";
import { NextPageWithLayout } from "@/pages/page";
import { Container, Group, Image, useMantineColorScheme } from "@mantine/core";

const QualSearch: NextPageWithLayout = () => {
  const { colorScheme } = useMantineColorScheme();

  const demoImage =
    colorScheme === "dark"
      ? "/demo-dark-no-border.png"
      : "/demo-light-no-border.png";

  return (
    <>
      <Container
        size={1400}
        className="relative pt-[120px] pb-[80px] lg:pt-[80px] lg:pb-[60px]"
      >
        <Dots
          className="absolute text-[#2c2e33] dark:text-[#f1f3f5]"
          style={{ left: 60, top: 0 }}
        />
        <Dots
          className="absolute text-[#2c2e33] dark:text-[#f1f3f5]"
          style={{ left: 0, top: 140 }}
        />
        <Dots
          className="absolute text-[gray-100] dark:text-[#f1f3f5]"
          style={{ right: 0, top: 60 }}
        />

        <Hero />

        <Group mt="xl" w="100%" justify="center">
          <Image src={demoImage} alt="Demo image" />
        </Group>
      </Container>
    </>
  );
};

export default QualSearch;
QualSearch.getLayout = (page) => {
  return <HomePageLayout>{page}</HomePageLayout>;
};
