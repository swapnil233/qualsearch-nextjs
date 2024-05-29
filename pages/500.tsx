import PrimaryLayout from "@/components/layout/primary/PrimaryLayout";
import SharedHead from "@/components/shared/SharedHead";
import {
  Button,
  Container,
  Group,
  Text,
  Title,
  createStyles,
  rem,
} from "@mantine/core";
import Link from "next/link";
import { NextPageWithLayout } from "./page";

const useStyles = createStyles((theme) => ({
  root: {
    paddingTop: rem(80),
    paddingBottom: rem(80),
  },

  label: {
    textAlign: "center",
    fontWeight: 900,
    fontSize: rem(220),
    lineHeight: 1,
    marginBottom: `calc(${theme.spacing.xl} * 1.5)`,
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[4]
        : theme.colors.gray[2],

    [theme.fn.smallerThan("sm")]: {
      fontSize: rem(120),
    },
  },

  title: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    textAlign: "center",
    fontWeight: 900,
    fontSize: rem(38),

    [theme.fn.smallerThan("sm")]: {
      fontSize: rem(32),
    },
  },

  description: {
    maxWidth: rem(500),
    margin: "auto",
    marginTop: theme.spacing.xl,
    marginBottom: `calc(${theme.spacing.xl} * 1.5)`,
  },
}));

const NotFound: NextPageWithLayout = () => {
  const { classes } = useStyles();

  return (
    <>
      <SharedHead
        title="Error 500!"
        description="500! Internal server error."
      />
      <Container className={classes.root}>
        <div className={classes.label}>500</div>
        <Title className={classes.title}>
          Error 500: Internal Server Error
        </Title>
        <Text
          color="dimmed"
          size="lg"
          align="center"
          className={classes.description}
        >
          Sorry, an error has occurred, and we are working to fix it. Please
          contact help@qualsearch.io if the problem persists. Thank you for your
          patience.
        </Text>
        <Group position="center">
          <Link href="/">
            <Button variant="default" size="md">
              Take me home
            </Button>
          </Link>
        </Group>
      </Container>
    </>
  );
};

export default NotFound;

NotFound.getLayout = (page) => {
  return <PrimaryLayout>{page}</PrimaryLayout>;
};
