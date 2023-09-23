import { useNotes } from "@/contexts/NotesContext";
import {
  Box,
  Group,
  Paper,
  SimpleGrid,
  Text,
  useMantineTheme,
} from "@mantine/core";
import {
  IconHourglassHigh,
  IconMessage,
  IconTag,
  IconUsers,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";

type IconKey = "duration" | "notes" | "tags" | "contributors";

const icons = {
  duration: IconHourglassHigh,
  notes: IconMessage,
  tags: IconTag,
  contributors: IconUsers,
};

interface StatsGridProps {
  duration: string;
}

interface StatData {
  title: string;
  icon: IconKey;
  value: number | string;
}

export function StatsGrid({ duration }: StatsGridProps) {
  const theme = useMantineTheme();
  const { notes } = useNotes();
  const [tagsCount, setTagsCount] = useState<number>(0);

  // Get the number of unique tags being used
  useEffect(() => {
    setTagsCount(
      new Set(notes.flatMap((note) => note.tags.map((tag) => tag.id))).size
    );
  }, [notes]);

  // Get the number of contributors
  let contributorsCount: number = useMemo(() => {
    return new Set(notes.map((note) => note.createdByUserId)).size;
  }, [notes]);

  const data: StatData[] = [
    {
      title: "Duration",
      icon: "duration",
      value: duration,
    },
    {
      title: "Notes",
      icon: "notes",
      value: notes.length,
    },
    {
      title: "Tags used",
      icon: "tags",
      value: tagsCount,
    },
    {
      title: "Contributors",
      icon: "contributors",
      value: contributorsCount,
    },
  ];

  const stats = data.map((stat) => {
    const Icon = icons[stat.icon];

    return (
      <Paper withBorder p="md" key={stat.title}>
        <Group position="apart">
          <Text size="xs" color="dimmed" fw={700} tt={"capitalize"}>
            {stat.title}
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

        <Group align="flex-end" spacing="xs" mt={25}>
          <Text fz={"1.5rem"} fw={400} lh={1}>
            {stat.value}
          </Text>
        </Group>
      </Paper>
    );
  });

  return (
    <Box mt={"lg"}>
      <SimpleGrid
        cols={4}
        breakpoints={[
          { maxWidth: "md", cols: 2 },
          { maxWidth: "xs", cols: 1 },
        ]}
      >
        {stats}
      </SimpleGrid>
    </Box>
  );
}
