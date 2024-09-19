import { Button, Card, Grid, Group, Stack, Text, Title } from "@mantine/core";
import Image from "next/image";

const Integrations = () => {
  return (
    <Grid gutter="xl">
      <Grid.Col span={{ base: 12, md: 4 }}>
        <Stack gap="xs">
          <Text fw={500} size="lg" c="#333333">
            Integrations
          </Text>
          <Text c="#7D7D7D">
            Easily set up integrations with just a few clicks.
          </Text>
        </Stack>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 8 }}>
        <Card radius="md" withBorder p={0}>
          <Stack gap={24} px={{ base: 16, md: 32 }} py={{ base: 16, md: 32 }}>
            <Group wrap="nowrap">
              <Group wrap="nowrap" mr="auto">
                <Image
                  src="/gc.svg"
                  width={42}
                  height={42}
                  alt="Google Calendar logo"
                />
                <Stack gap={4}>
                  <Title order={4}>Google Calendar</Title>
                  <Text>
                    Connect your calendar to check your availability and sync
                    events
                  </Text>
                </Stack>
              </Group>
              <Group justify="flex-end">
                <Button>Connect</Button>
              </Group>
            </Group>

            <Group wrap="nowrap">
              <Group wrap="nowrap" mr="auto">
                <Image
                  src="/msft.svg"
                  width={42}
                  height={42}
                  alt="Microsoft logo"
                />
                <Stack gap={4} align="stretch">
                  <Title order={4}>Microsoft</Title>
                  <Text>
                    Connect your Microsoft account to check your Outlook
                    Calendar availability.
                  </Text>
                </Stack>
              </Group>
              <Group justify="flex-end">
                <Button>Connect</Button>
              </Group>
            </Group>

            <Group wrap="nowrap">
              <Group wrap="nowrap" mr="auto">
                <Image src="/zoom.png" width={42} height={42} alt="Zoom logo" />
                <Stack gap={4}>
                  <Title order={4}>Zoom</Title>
                  <Text>
                    Connect to Zoom to synchronize meetings on your Interview
                    studies.
                  </Text>
                </Stack>
              </Group>
              <Group justify="flex-end">
                <Button>Connect</Button>
              </Group>
            </Group>
          </Stack>
        </Card>
      </Grid.Col>
    </Grid>
  );
};

export default Integrations;
