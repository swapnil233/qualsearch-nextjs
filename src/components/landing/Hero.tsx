import useTeamRedirect from "@/hooks/useTeamRedirect";
import {
  Button,
  Container,
  Group,
  Text,
  Title,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { IconPlayerPlay } from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export const Hero = () => {
  const teamRedirectUrl = useTeamRedirect();
  const { data: session, status } = useSession();
  const { colorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();

  return (
    <div className="relative z-10">
      <Title
        ta="center"
        fw={800}
        lh={1.1}
        fz="60px"
        lts={-1}
        c={colorScheme === "light" ? theme.black : theme.white}
        mb="xs"
      >
        Streamlined UX Research
        <br />
        With the Power of AI.
      </Title>

      <Container p={20} size={600}>
        <Text fz={24} c="dimmed" ta="center">
          Collaborate with your team to easily analyze user interviews using
          transcript tagging and AI powered insights.
        </Text>
      </Container>

      <Group mt="md" justify="center">
        <Button
          size="lg"
          variant="default"
          leftSection={<IconPlayerPlay size={20} />}
        >
          Demo
        </Button>
        <Button
          size="lg"
          component={Link}
          href={status === "unauthenticated" ? "/signin" : teamRedirectUrl}
        >
          Get started
        </Button>
      </Group>
    </div>
  );
};
