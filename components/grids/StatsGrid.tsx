import { Stat } from "@/types";
import { Box, Group, Paper, SimpleGrid, Text } from "@mantine/core";
import { FC } from "react";

const GRID_BREAKPOINTS = [
  { maxWidth: "md", cols: 2 },
  { maxWidth: "xs", cols: 1 },
];

interface StatsGridProps {
  stats: Stat[];
  columns?: number;
}

const StatsGrid: FC<StatsGridProps> = ({ stats, columns }) => {
  return (
    <Box mt="lg">
      <SimpleGrid cols={columns || 4} breakpoints={GRID_BREAKPOINTS}>
        {stats.map((stat) => (
          <Paper key={stat.title} withBorder p="md">
            <Group position="apart">
              <Text size="xs" color="dimmed" fw={700} tt={"capitalize"}>
                {stat.title}
              </Text>
              {stat.icon}
            </Group>
            <Group align="flex-end" spacing="xs" mt="lg">
              <Text fz={"1.5rem"} fw={400} lh={1}>
                {stat.value}
              </Text>
            </Group>
          </Paper>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default StatsGrid;
