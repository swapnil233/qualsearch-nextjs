import { Stat } from "@/types";
import { Box, Group, Paper, SimpleGrid, Text } from "@mantine/core";
import { FC } from "react";

interface StatsGridProps {
  stats: Stat[];
  columns?: number;
}

const StatsGrid: FC<StatsGridProps> = ({ stats, columns }) => {
  return (
    <Box mt="lg">
      <SimpleGrid cols={{ base: columns || 4, md: 2, xs: 1 }}>
        {stats.map((stat) => (
          <Paper key={stat.title} withBorder p="md">
            <Group justify="space-between">
              <Text size="xs" color="dimmed" fw={700} tt={"capitalize"}>
                {stat.title}
              </Text>
              {stat.icon}
            </Group>
            <Group align="flex-end" gap="xs" mt="lg">
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
