import usePersonalInfoForm from "@/hooks/usePersonalInfoForm";
import {
  Avatar,
  Button,
  Card,
  Checkbox,
  Grid,
  Group,
  Select,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { User, UserPreferences } from "@prisma/client";

interface PersonalInfoProps {
  user: User;
  preferences: UserPreferences;
}

const PersonalInfo = ({ user, preferences }: PersonalInfoProps) => {
  const {
    register,
    handleSubmit,
    errors,
    onSubmit,
    isLoading,
    setValue,
    watch,
  } = usePersonalInfoForm(user, preferences);

  const getErrorMessage = (error: any) => {
    if (error) {
      if (typeof error.message === "string") {
        return error.message;
      }
      if (typeof error === "string") {
        return error;
      }
    }
    return undefined;
  };

  const contactTimeOptions = [
    { value: "MORNING", label: "Morning" },
    { value: "AFTERNOON", label: "Afternoon" },
    { value: "EVENING", label: "Evening" },
  ];

  // Watch the current value of contactTimePreference
  const contactTimePreference = watch("contactTimePreference");

  return (
    <Grid gutter="xl">
      <Grid.Col span={{ base: 12, md: 4 }}>
        <Stack gap="xs">
          <Text fw={500} size="lg">
            Personal information
          </Text>
          <Text c="dimmed">
            This information may be viewable by other users of this application.
          </Text>
        </Stack>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 8 }}>
        <Card radius="md" withBorder p={0}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack>
              <Stack
                gap={24}
                px={{ base: 16, md: 32 }}
                py={{ base: 16, md: 32 }}
              >
                <Stack gap={8}>
                  <Text fw={500}>Profile picture</Text>
                  <Group>
                    <Avatar
                      size="lg"
                      src={user.image}
                      alt="User profile picture."
                    />
                    <Group gap="xs">
                      <Button variant="default">Change</Button>
                      <Text size="sm" c="#7d7d7d">
                        PNG, JPG; Max 3mb
                      </Text>
                    </Group>
                  </Group>
                </Stack>
                <TextInput
                  radius="xs"
                  label="Full name"
                  placeholder="John"
                  {...register("name")}
                  error={getErrorMessage(errors.name)}
                />
                <Tooltip
                  label={
                    user.emailVerified &&
                    `Your email was verified on ${new Date(
                      user.emailVerified
                    ).toDateString()} at ${new Date(
                      user.emailVerified
                    ).toLocaleTimeString()}. Email address cannot be changed.`
                  }
                >
                  <TextInput
                    radius="xs"
                    label="Email address"
                    description="Email address cannot be changed."
                    placeholder={user.email || ""}
                    disabled
                  />
                </Tooltip>
                <Select
                  label="Preferred contact time"
                  placeholder="Pick one"
                  data={contactTimeOptions}
                  radius="xs"
                  value={contactTimePreference || ""}
                  onChange={(value) => {
                    if (typeof value === "string") {
                      setValue("contactTimePreference", value);
                    }
                  }}
                />
                <Stack gap="xs">
                  <Checkbox
                    {...register("emailNotifications")}
                    label="Send me emails about my account."
                  />
                  <Checkbox
                    {...register("smsNotifications")}
                    label="Send me notifications about product updates."
                  />
                  <Checkbox
                    {...register("pushNotifications")}
                    label="Send me occasional newsletters and special offers."
                  />
                </Stack>
              </Stack>
              <div className="h-[1px] w-full bg-[#D6D6D6]"></div>
              <Group justify="flex-start" px={{ base: 16, md: 32 }} pb={16}>
                <Button type="submit" loading={isLoading}>
                  Save changes
                </Button>
              </Group>
            </Stack>
          </form>
        </Card>
      </Grid.Col>
    </Grid>
  );
};

export default PersonalInfo;
