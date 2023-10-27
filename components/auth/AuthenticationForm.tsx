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
import { IconBrandSlack } from "@tabler/icons-react";
import { Provider } from "next-auth/providers";
import { signIn } from "next-auth/react";
import { FC } from "react";
import { GoogleIcon } from "../buttons/GoogleIcon";

interface IAuthenticationFormProps {
  providers: Provider[];
}

const AuthenticationForm: FC<IAuthenticationFormProps> = ({ providers }) => {
  const [type, toggle] = useToggle(["login", "register"]);

  console.log(providers);

  const form = useForm({
    initialValues: {
      email: "",
      name: "",
      password: "",
      terms: true,
    },

    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : "Invalid email"),
      password: (val) =>
        val.length <= 6
          ? "Password should include at least 6 characters"
          : null,
    },
  });

  return (
    <Paper radius="md" p="xl" m={"lg"} withBorder w={"90%"} maw={400}>
      <Text size="lg" fw={500}>
        Welcome to QualSearch, {type} with
      </Text>

      <Group grow mb="md" mt="md">
        {Object.values(providers).map((provider) => (
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
            onClick={() => signIn(provider.id)}
          >
            {type === "register" ? `${provider.name}` : `${provider.name}`}
          </Button>
        ))}
      </Group>

      <Divider label="Or continue with email" labelPosition="center" my="lg" />

      <form onSubmit={form.onSubmit(() => {})}>
        <Stack>
          {type === "register" && (
            <TextInput
              disabled
              label="Name"
              placeholder="Your name"
              value={form.values.name}
              onChange={(event) =>
                form.setFieldValue("name", event.currentTarget.value)
              }
              radius="md"
            />
          )}

          <TextInput
            disabled
            required
            label="Email"
            placeholder="hello@qualsearch.com"
            value={form.values.email}
            onChange={(event) =>
              form.setFieldValue("email", event.currentTarget.value)
            }
            error={form.errors.email && "Invalid email"}
            radius="md"
          />

          <PasswordInput
            disabled
            required
            label="Password"
            placeholder="Your password"
            value={form.values.password}
            onChange={(event) =>
              form.setFieldValue("password", event.currentTarget.value)
            }
            error={
              form.errors.password &&
              "Password should include at least 6 characters"
            }
            radius="md"
          />

          {type === "register" && (
            <Checkbox
              disabled
              label="I accept terms and conditions"
              checked={form.values.terms}
              onChange={(event) =>
                form.setFieldValue("terms", event.currentTarget.checked)
              }
            />
          )}
        </Stack>

        <Group position="apart" mt="xl">
          <Anchor
            component="button"
            type="button"
            c="dimmed"
            onClick={() => toggle()}
            size="xs"
          >
            {type === "register"
              ? "Already have an account? Login"
              : "Don't have an account? Register"}
          </Anchor>
          <Button type="submit" radius="xl" disabled>
            {upperFirst(type)}
          </Button>
        </Group>
      </form>
    </Paper>
  );
};

export { AuthenticationForm };
