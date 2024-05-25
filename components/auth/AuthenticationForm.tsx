import {
  Anchor,
  Button,
  Checkbox,
  Divider,
  Group,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { TwitterIcon } from "@mantine/ds";
import { useForm } from "@mantine/form";
import { upperFirst, useToggle } from "@mantine/hooks";
import { IconBrandSlack, IconCircleCheck, IconX } from "@tabler/icons-react";
import { Provider } from "next-auth/providers";
import { signIn } from "next-auth/react";
import { FC, useState } from "react";
import { GoogleIcon } from "../buttons/GoogleIcon";

interface IAuthenticationFormProps {
  providers: Provider[];
}

const passwordRequirements = [
  { regex: /.{6,}/, label: "At least 6 characters" },
  { regex: /[A-Z]/, label: "At least one uppercase letter" },
  { regex: /[a-z]/, label: "At least one lowercase letter" },
  { regex: /[0-9]/, label: "At least one number" },
  { regex: /[^A-Za-z0-9]/, label: "At least one special character" },
];

const AuthenticationForm: FC<IAuthenticationFormProps> = ({ providers }) => {
  const [type, toggle] = useToggle(["login", "register"]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      email: "",
      name: "",
      password: "",
      terms: false,
    },

    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : "Invalid email"),
      password: (val) =>
        val.length <= 6
          ? "Password should include at least 6 characters"
          : null,
    },
  });

  const checkPasswordRequirements = (password: string) =>
    passwordRequirements.map((requirement) => ({
      label: requirement.label,
      meets: requirement.regex.test(password),
    }));

  const passwordValidation = checkPasswordRequirements(password);

  const handleSubmit = async (values: typeof form.values) => {
    if (loading) return;

    setLoading(true);

    if (type === "register") {
      // Register user
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      // Handle registration error
      if (!response.ok) {
        // Handle registration error
        alert("Registration failed");
        setLoading(false);
        return;
      }

      // Login user
      const result = await signIn("credentials", {
        redirect: true,
        callbackUrl: "/teams",
        email: values.email,
        password: values.password,
      });

      if (result?.error) {
        // Handle login error
        alert("Login failed");
        setLoading(false);
      }

      setLoading(false);
      return;
    }

    // Login user
    if (type === "login") {
      const result = await signIn("credentials", {
        redirect: true,
        callbackUrl: "/teams",
        email: values.email,
        password: values.password,
      });

      if (result?.error) {
        // Handle login error
        alert("Login failed");
        setLoading(false);
      }

      setLoading(false);
    }

    setLoading(false);
  };

  return (
    <Paper radius="md" p="xl" m={"lg"} withBorder w={"90%"} maw={400}>
      <Text size="lg" fw={500}>
        Welcome to QualSearch, {type} with
      </Text>

      <Group grow mb="md" mt="md">
        {Object.values(providers).map(
          (provider) =>
            provider.name !== "Credentials" && (
              <Button
                key={provider.name}
                leftIcon={
                  provider.name === "Google" ? (
                    <GoogleIcon />
                  ) : provider.name === "Twitter" ? (
                    <TwitterIcon />
                  ) : provider.name === "Slack" ? (
                    <IconBrandSlack />
                  ) : null
                }
                variant="default"
                disabled={provider.name !== "Google"}
                onClick={() => signIn(provider.id)}
              >
                {provider.name}
              </Button>
            )
        )}
      </Group>

      <Divider label="Or continue with email" labelPosition="center" my="lg" />

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          {type === "register" && (
            <TextInput
              // disabled
              label="Name"
              required
              placeholder="John Doe"
              value={form.values.name}
              onChange={(event) =>
                form.setFieldValue("name", event.currentTarget.value)
              }
              radius="md"
            />
          )}

          <TextInput
            // disabled
            required
            label="Email"
            placeholder="john.doe@work.com"
            value={form.values.email}
            onChange={(event) =>
              form.setFieldValue("email", event.currentTarget.value)
            }
            error={form.errors.email && "Invalid email"}
            radius="md"
          />

          <PasswordInput
            required
            label="Password"
            placeholder="Your password"
            value={form.values.password}
            onChange={(event) => {
              form.setFieldValue("password", event.currentTarget.value);
              setPassword(event.currentTarget.value);
            }}
            error={
              form.errors.password &&
              "Password should include at least 6 characters"
            }
            radius="md"
          />

          {type === "register" && (
            <PasswordInput
              required
              label="Confirm password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.currentTarget.value);
              }}
              radius="md"
            />
          )}

          {type === "register" && (
            <Stack spacing={"xs"}>
              {passwordValidation.map((req, index) => (
                <Group key={index} spacing="xs">
                  {req.meets ? (
                    <IconCircleCheck size={16} color="teal" />
                  ) : (
                    <IconX size={16} color="red" />
                  )}
                  <Text size="sm">{req.label}</Text>
                </Group>
              ))}
              <Group spacing="xs">
                {confirmPassword === password && confirmPassword !== "" ? (
                  <IconCircleCheck size={16} color="teal" />
                ) : (
                  <IconX size={16} color="red" />
                )}
                <Text size="sm">Passwords match</Text>
              </Group>
            </Stack>
          )}

          {type === "register" && (
            <Checkbox
              mt={"md"}
              label="I accept terms and conditions"
              checked={form.values.terms}
              onChange={(event) =>
                form.setFieldValue("terms", event.currentTarget.checked)
              }
            />
          )}
        </Stack>

        <Stack mt={"xl"}>
          <Button
            type="submit"
            loading={loading}
            disabled={
              type === "register"
                ? !form.values.terms ||
                  passwordValidation.some((req) => !req.meets) ||
                  loading ||
                  confirmPassword !== password
                : false
            }
          >
            {upperFirst(type)}
          </Button>
          <Anchor
            component="button"
            type="button"
            mt={"md"}
            onClick={() => toggle()}
            size="sm"
            fw={500}
            color="black"
          >
            {type === "register"
              ? "Already have an account? Login"
              : "Don't have an account? Register"}
          </Anchor>
        </Stack>
      </form>
    </Paper>
  );
};

export { AuthenticationForm };
