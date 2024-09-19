import useRegistrationForm from "@/hooks/useRegistrationForm";
import app from "@/lib/app";
import isPasswordValid from "@/lib/auth/isPasswordValid";
import {
  Anchor,
  Button,
  Divider,
  Group,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { Provider } from "next-auth/providers/index";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { GoogleIcon } from "../icons/GoogleIcon";
import { PasswordStrength } from "./PasswordStrength";

interface IRegistrationFormProps {
  providers: Provider[];
}

const RegistrationForm: React.FC<IRegistrationFormProps> = ({ providers }) => {
  const { colorScheme } = useMantineColorScheme();
  const {
    register,
    handleSubmit,
    errors,
    onSubmit,
    isLoading,
    watch,
    setValue,
  } = useRegistrationForm();

  const password = watch("password");

  return (
    <Paper radius="md" p="md" m={"lg"} w={"95%"} maw={450}>
      <Stack justify="stretch" gap="xs" mb="md" align="center">
        <Link href="/">
          <Image
            src={colorScheme === "dark" ? app.logoUrl.dark : app.logoUrl.light}
            alt={app.logoUrlAlt}
            height={60}
            width={160}
          />
        </Link>

        <Stack align="center" mt={"md"} gap={4}>
          <Title
            order={3}
            style={{
              textAlign: "center",
            }}
          >
            Let&apos;s get started with {app.name}!
          </Title>
          <Text>No credit card details required.</Text>
        </Stack>
      </Stack>
      <Stack>
        {Object.values(providers).map(
          (provider) =>
            provider.name !== "Credentials" && (
              <Button
                key={provider.name}
                leftSection={provider.name === "Google" ? <GoogleIcon /> : null}
                variant="default"
                onClick={() => signIn(provider.id)}
                fullWidth
                fw={400}
                radius={"xs"}
              >
                Register with {provider.name}
              </Button>
            )
        )}
      </Stack>

      <Divider
        label="Or register with email and password"
        labelPosition="center"
        my="lg"
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack>
          <TextInput
            label="Name"
            required
            type="text"
            autoComplete="name"
            placeholder="John Doe"
            {...register("name")}
            error={errors.name?.message}
            radius="xs"
          />

          <TextInput
            required
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="john.doe@work.com"
            {...register("email")}
            error={errors.email?.message}
            radius="xs"
          />

          <PasswordInput
            required
            label="Password"
            placeholder="Your password"
            value={password || ""}
            onChange={(event) =>
              setValue("password", event.currentTarget.value)
            }
            error={errors.password?.message}
            radius="xs"
          />

          <PasswordStrength value={password || ""} />
        </Stack>

        <Stack mt={"xl"} align="stretch">
          <Button
            type="submit"
            loading={isLoading}
            radius="xs"
            disabled={!isPasswordValid(watch("password"))}
          >
            {!isLoading ? "Get started" : "Registering..."}
          </Button>
          <Group gap={3} align="stretch" justify="center">
            <Text size="sm">Already have an account?</Text>
            <Anchor component={Link} href="/signin" size="sm" fw={500}>
              Sign in
            </Anchor>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
};

export { RegistrationForm };
