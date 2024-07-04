import useTeamRedirect from "@/hooks/useTeamRedirect";
import {
  Box,
  Button,
  Container,
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

  const textColor = colorScheme === "dark" ? "text-white" : "text-black";
  const highlightColor =
    theme.colors[theme.primaryColor][colorScheme === "dark" ? 4 : 6];

  return (
    <div className="relative pt-30 pb-20 sm:pt-20 sm:pb-15">
      <div className="relative z-10">
        <Title
          className={`text-center font-extrabold leading-tight text-6xl tracking-tight mb-2 ${textColor} font-greycliff sm:text-5xl`}
        >
          Streamlined{" "}
          <Text component="span" className={`text-${highlightColor}`} inherit>
            UX Research
          </Text>{" "}
          <br />
          With the Power of AI.
        </Title>

        <Container p={20} size={600}>
          <Text
            size="lg"
            color="dimmed"
            className="w-full text-center text-2xl sm:text-xl"
          >
            Collaborate with your team to easily analyze user interviews using
            transcript tagging and AI powered insights.
          </Text>
        </Container>

        <Box className="mt-6 flex justify-center sm:flex-col">
          <Button
            className="mt-0 sm:mt-4 sm:ml-0 ml-4"
            size="lg"
            variant="default"
            color="gray"
            component="a"
            leftSection={<IconPlayerPlay size={20} />}
          >
            Demo
          </Button>
          <Link
            href={status === "unauthenticated" ? "/signin" : teamRedirectUrl}
            className="mt-0 sm:mt-4 sm:ml-0 ml-4"
          >
            <Button className="w-full" size="lg">
              Get started
            </Button>
          </Link>
        </Box>
      </div>
    </div>
  );
};
