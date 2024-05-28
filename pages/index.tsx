import Dots from "@/components/landing/Dots";
import { Hero } from "@/components/landing/Hero";
import { useStyles } from "@/components/landing/HomePageStyles";
import HomePageLayout from "@/components/layout/home/HomePageLayout";
import { NextPageWithLayout } from "@/pages/page";
import { Container, Image, useMantineTheme } from "@mantine/core";

const QualSearch: NextPageWithLayout = () => {
  const { classes } = useStyles();
  const theme = useMantineTheme();

  const demoImage =
    theme.colorScheme === "dark"
      ? "/demo-dark-no-border.png"
      : "/demo-light-no-border.png";

  return (
    <>
      <Container className={classes.wrapper} size={1400}>
        <Dots className={classes.dots} style={{ left: 60, top: 0 }} />
        <Dots className={classes.dots} style={{ left: 0, top: 140 }} />
        <Dots className={classes.dots} style={{ right: 0, top: 60 }} />

        <Hero />

        <div className={classes.demoImage}>
          <Image src={demoImage} alt="Demo image" />
        </div>
      </Container>
    </>
  );
};

export default QualSearch;
QualSearch.getLayout = (page) => {
  return <HomePageLayout>{page}</HomePageLayout>;
};
