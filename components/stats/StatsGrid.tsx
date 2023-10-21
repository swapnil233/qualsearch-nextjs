import { useNotes } from "@/contexts/NotesContext";
import { Box, SimpleGrid } from "@mantine/core";
import { FC, useEffect, useMemo, useState } from "react";
import Stat, { ICONS } from "./Stat";

interface StatsGridProps {
  duration: string;
}

const GRID_BREAKPOINTS = [
  { maxWidth: "md", cols: 2 },
  { maxWidth: "xs", cols: 1 },
];

const StatsGrid: FC<StatsGridProps> = ({ duration }) => {
  const { notes } = useNotes();
  const [tagsCount, setTagsCount] = useState<number>(0);

  // Calculate unique tags
  useEffect(() => {
    const uniqueTags = new Set(
      notes.flatMap((note) => note.tags.map((tag) => tag.id))
    );
    setTagsCount(uniqueTags.size);
  }, [notes]);

  // Calculate unique contributors
  const contributorsCount = useMemo(() => {
    return new Set(notes.map((note) => note.createdByUserId)).size;
  }, [notes]);

  const data: Array<{
    title: string;
    icon: keyof typeof ICONS;
    value: string | number;
  }> = useMemo(
    () => [
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
    ],
    [duration, notes.length, tagsCount, contributorsCount]
  );

  return (
    <Box mt="lg">
      <SimpleGrid cols={4} breakpoints={GRID_BREAKPOINTS}>
        {data.map((stat) => (
          <Stat key={stat.title} {...stat} />
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default StatsGrid;
