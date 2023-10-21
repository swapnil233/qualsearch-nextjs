import { Group, Paper, Text, useMantineTheme } from "@mantine/core";
import {
  IconHourglassHigh,
  IconMessage,
  IconTag,
  IconUsers,
} from "@tabler/icons-react";
import { FC } from "react";

interface StatProps {
  title: string;
  icon: keyof typeof ICONS;
  value: number | string;
}

export const ICONS = {
  duration: IconHourglassHigh,
  notes: IconMessage,
  tags: IconTag,
  contributors: IconUsers,
};

const Stat: FC<StatProps> = ({ title, icon, value }) => {
  const theme = useMantineTheme();
  const Icon = ICONS[icon];

  return (
    <Paper withBorder p="md">
      <Group position="apart">
        <Text size="xs" color="dimmed" fw={700} tt={"capitalize"}>
          {title}
        </Text>
        <Icon
          color={
            theme.colorScheme === "dark"
              ? theme.colors.dark[3]
              : theme.colors.gray[4]
          }
          size="1.4rem"
          stroke={1.5}
        />
      </Group>
      <Group align="flex-end" spacing="xs" mt="lg">
        <Text fz={"1.5rem"} fw={400} lh={1}>
          {value}
        </Text>
      </Group>
    </Paper>
  );
};

export default Stat;
