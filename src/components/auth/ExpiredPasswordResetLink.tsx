import app from "@/lib/app";
import {
  Button,
  Paper,
  Stack,
  Text,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import Image from "next/image";
import Link from "next/link";

export interface IExpiredPasswordResetLinkProps {}

const ExpiredPasswordResetLink: React.FC<
  IExpiredPasswordResetLinkProps
> = () => {
  const { colorScheme } = useMantineColorScheme();

  return (
    <Paper radius="md" p="md" m={"lg"} w={"95%"} maw={450}>
      <Stack justify="stretch" gap="xs" mb="md" align="center">
        <Link href="/">
          <Image
            src={colorScheme === "dark" ? app.logoUrl.dark : app.logoUrl.light}
            alt={app.logoUrlAlt}
            height={60}
            width={60}
          />
        </Link>
        <Stack align="center" mt={"md"} gap={4}>
          <Title
            order={3}
            style={{
              textAlign: "center",
            }}
          >
            This link is invalid or expired
          </Title>
          <Text>Please login to continue.</Text>
        </Stack>
        <Button component={Link} href="/signin">
          Sign in
        </Button>
      </Stack>
    </Paper>
  );
};

export default ExpiredPasswordResetLink;
