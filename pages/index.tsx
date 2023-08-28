import Dots from "@/components/landing/Dots";
import HomePageLayout from "@/components/layout/home/HomePageLayout";
import { NextPageWithLayout } from "@/pages/page";
import {
  Box,
  Button,
  Container,
  Image,
  Text,
  Title,
  createStyles,
  useMantineTheme,
} from "@mantine/core";
import { User } from "@prisma/client";
import { IconPlayerPlay } from "@tabler/icons-react";
import { signIn, useSession } from "next-auth/react";

interface TranscriptionPageProps {
  user: User | null;
}

const useStyles = createStyles((theme) => ({
  wrapper: {
    position: "relative",
    paddingTop: 120,
    paddingBottom: 80,

    "@media (max-width: 755px)": {
      paddingTop: 80,
      paddingBottom: 60,
    },
  },

  inner: {
    position: "relative",
    zIndex: 1,
  },

  dots: {
    position: "absolute",
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[5]
        : theme.colors.gray[1],

    "@media (max-width: 755px)": {
      display: "none",
    },
  },

  dotsLeft: {
    left: 0,
    top: 0,
  },

  title: {
    textAlign: "center",
    fontWeight: 800,
    lineHeight: 1.1,
    fontSize: 60,
    letterSpacing: -1,
    color: theme.colorScheme === "dark" ? theme.white : theme.black,
    marginBottom: theme.spacing.xs,
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,

    "@media (max-width: 520px)": {
      fontSize: 40,
    },
  },

  highlight: {
    color:
      theme.colors[theme.primaryColor][theme.colorScheme === "dark" ? 4 : 6],
  },

  description: {
    width: "100%",
    textAlign: "center",
    fontSize: 24,

    "@media (max-width: 520px)": {
      fontSize: 20,
    },
  },

  controls: {
    marginTop: theme.spacing.lg,
    display: "flex",
    justifyContent: "center",

    "@media (max-width: 520px)": {
      flexDirection: "column",
    },
  },

  control: {
    "&:not(:first-of-type)": {
      marginLeft: theme.spacing.md,
    },

    "@media (max-width: 520px)": {
      "&:not(:first-of-type)": {
        marginTop: 15,
        marginLeft: 0,
      },
    },
  },

  demoImage: {
    marginTop: 64,
    width: "100%",
    display: "flex",
    justifyContent: "center",

    // Make image 70% width on laptop screens
    "@media (min-width: 1024px) and (max-width: 1440px)": {
      width: "70%",
      marginTop: 48,
      marginLeft: "auto",
      marginRight: "auto",
    },
  },
}));

const Transcription: NextPageWithLayout<TranscriptionPageProps> = () => {
  const { classes } = useStyles();
  const theme = useMantineTheme();
  const { data: session, status } = useSession();

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

        <div className={classes.inner}>
          <Title className={classes.title}>
            Steamlined{" "}
            <Text component="span" className={classes.highlight} inherit>
              UX Research
            </Text>{" "}
            <br />
            With the Power of AI.
          </Title>

          <Container p={20} size={600}>
            <Text size="lg" color="dimmed" className={classes.description}>
              Collaborate with your team to easily analyze user interviews using
              transcript tagging and AI powered insights.
            </Text>
          </Container>

          <Box className={classes.controls}>
            <Button
              className={classes.control}
              size="lg"
              variant="default"
              color="gray"
              component="a"
              leftIcon={<IconPlayerPlay size={20} />}
            >
              Demo
            </Button>

            {status === "authenticated" ? (
              <>
                <Button
                  className={classes.control}
                  size="lg"
                  component="a"
                  href="/teams"
                >
                  Dashboard
                </Button>
              </>
            ) : (
              <>
                <Button
                  className={classes.control}
                  size="lg"
                  component="a"
                  onClick={() => signIn(undefined, { callbackUrl: "/teams" })}
                >
                  Log in
                </Button>
              </>
            )}
          </Box>
        </div>

        <div className={classes.demoImage}>
          <Image src={demoImage} alt="Demo image" />
        </div>
      </Container>
    </>
  );
};

export default Transcription;
Transcription.getLayout = (page) => {
  return <HomePageLayout>{page}</HomePageLayout>;
};
