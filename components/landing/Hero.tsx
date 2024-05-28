import useTeamRedirect from "@/hooks/useTeamRedirect";
import { Box, Button, Container, Text, Title } from "@mantine/core";
import { IconPlayerPlay } from "@tabler/icons-react";
import Link from "next/link";
import { useStyles } from "./HomePageStyles";

export const Hero = () => {
  const { classes } = useStyles();
  const teamRedirectUrl = useTeamRedirect();

  return (
    <div className={classes.inner}>
      <Title className={classes.title}>
        Streamlined{" "}
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
        <Link href={teamRedirectUrl} className={classes.control}>
          <Button size="lg">Get started</Button>
        </Link>
      </Box>
    </div>
  );
};
