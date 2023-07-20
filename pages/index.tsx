import HomePageLayout from "@/components/layout/home/HomePageLayout";
import { NextPageWithLayout } from "@/pages/page";
import {
  Button,
  Container,
  Overlay,
  Text,
  Title,
  createStyles,
  rem,
} from "@mantine/core";
import { User } from "@prisma/client";
import { useRouter } from "next/router";

interface TranscriptionPageProps {
  user: User | null;
}

const useStyles = createStyles((theme) => ({
  wrapper: {
    position: "relative",
    paddingTop: rem(180),
    paddingBottom: rem(130),
    backgroundImage: `url(hero.jpeg)`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    [theme.fn.smallerThan("xs")]: {
      paddingTop: rem(80),
      paddingBottom: rem(50),
    },
  },

  inner: {
    position: "relative",
    zIndex: 1,
  },

  title: {
    fontWeight: 800,
    fontSize: rem(64),
    letterSpacing: rem(-1),
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.md,
    color: theme.white,
    marginBottom: theme.spacing.xs,
    textAlign: "center",

    [theme.fn.smallerThan("xs")]: {
      fontSize: rem(28),
      textAlign: "left",
    },
  },

  highlight: {
    color: theme.colors[theme.primaryColor][4],
  },

  description: {
    color: theme.white,
    textAlign: "center",
    fontSize: theme.spacing.md,

    [theme.fn.smallerThan("xs")]: {
      fontSize: theme.fontSizes.md,
      textAlign: "left",
    },
  },

  controls: {
    marginTop: `calc(${theme.spacing.xl} * 1.5)`,
    display: "flex",
    justifyContent: "center",
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.md,

    [theme.fn.smallerThan("xs")]: {
      flexDirection: "column",
    },
  },

  control: {
    height: rem(42),
    fontSize: theme.fontSizes.md,

    "&:not(:first-of-type)": {
      marginLeft: theme.spacing.md,
    },

    [theme.fn.smallerThan("xs")]: {
      "&:not(:first-of-type)": {
        marginTop: theme.spacing.md,
        marginLeft: 0,
      },
    },
  },

  secondaryControl: {
    color: theme.white,
    backgroundColor: "rgba(255, 255, 255, .4)",

    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, .45) !important",
    },
  },
}));

const Transcription: NextPageWithLayout<TranscriptionPageProps> = () => {
  const { classes, cx } = useStyles();
  const router = useRouter();

  return (
    <section className={classes.wrapper}>
      <Overlay color="#000" opacity={0.65} zIndex={1} />

      <div className={classes.inner}>
        <Title className={classes.title}>
          AI powered analysis for{" "}
          <Text component="span" className={classes.highlight} inherit>
            UX teams
          </Text>
        </Title>

        <Container size={640}>
          <Text size="lg" className={classes.description}>
            Elevate your research by uploading and converting your interviews
            into transcripts. Use our AI-powered platform to spotlight pivotal
            moments, uncover recurring themes and patterns, and harness these
            insights to drive informed decisions. Collaborate effectively by
            sharing these evidence-backed findings with your team.
          </Text>
        </Container>

        <div className={classes.controls}>
          <Button
            className={classes.control}
            variant="white"
            size="lg"
            onClick={() => router.push("/teams")}
          >
            Get started
          </Button>
          <Button
            className={cx(classes.control, classes.secondaryControl)}
            size="lg"
          >
            Live demo
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Transcription;
Transcription.getLayout = (page) => {
  return <HomePageLayout>{page}</HomePageLayout>;
};
