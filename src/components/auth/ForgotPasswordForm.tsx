import app from "@/lib/app";
import {
  Anchor,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { FC, useState } from "react";

interface IForgotPasswordFormProps {}

const ForgotPasswordForm: FC<IForgotPasswordFormProps> = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { colorScheme } = useMantineColorScheme();

  const form = useForm({
    initialValues: {
      email: "",
    },

    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : "Invalid email"),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    if (loading) return;

    setLoading(true);

    const result = await fetch("/api/auth/request-password-reset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: values.email }),
    });

    const data = await result.json();

    if (result.ok) {
      notifications.show({
        title: "Password Reset Sent",
        message: "Please check your email for further instructions.",
        color: "green",
      });
      router.push("/signin");
    } else {
      notifications.show({
        title: "Could not reset password",
        message:
          data.error ||
          "An error occurred while resetting your password. We are working to resolve this issue.",
        color: "red",
        withCloseButton: false,
      });
    }

    setLoading(false);
  };

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
            Forgot your password?
          </Title>
          <Text>Enter your email to reset your password.</Text>
        </Stack>
      </Stack>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            required
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="john.doe@work.com"
            value={form.values.email}
            onChange={(event) =>
              form.setFieldValue("email", event.currentTarget.value)
            }
            error={form.errors.email && "Invalid email"}
            radius="xs"
          />
        </Stack>

        <Stack mt={"xl"} align="stretch">
          <Button type="submit" loading={loading} radius="xs">
            {!loading ? "Send password reset link" : "Sending..."}
          </Button>
          <Group gap={3} align="stretch" justify="center">
            <Text size="sm">Remember your password?</Text>
            <Anchor component={Link} href="/signin" size="sm" fw={500}>
              Sign in
            </Anchor>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
};

export { ForgotPasswordForm };
