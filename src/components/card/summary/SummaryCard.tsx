import parseMarkdown from "@/lib/parseMarkdown";
import {
  Card,
  Skeleton,
  Stack,
  Text,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { FC, memo } from "react";

export interface ISummaryCard {
  summary: String;
  dateSummarized: Date | string;
}

const SummaryCard: FC<ISummaryCard> = ({ summary, dateSummarized }) => {
  const { colorScheme } = useMantineColorScheme();
  return (
    <Card
      withBorder
      radius="sm"
      style={(theme) => ({
        backgroundColor:
          colorScheme === "dark" ? theme.colors.dark[6] : theme.white,
      })}
    >
      <Stack gap={"xl"}>
        <Stack gap={"md"}>
          <Title order={3}>Summary</Title>
          {summary !== "" ? (
            summary
              .split("\n")
              .map((line, i) => <Text key={i}>{parseMarkdown(line)}</Text>)
          ) : (
            <>
              <Skeleton height={11} radius={"xs"} />
              <Skeleton height={11} radius={"xs"} />
              <Skeleton height={11} radius={"xs"} />
              <Skeleton height={11} radius={"xs"} width={"80%"} />
            </>
          )}
        </Stack>
        {dateSummarized !== "" ? (
          <Text color="dimmed">{`Summarized by AI on ${new Date(
            dateSummarized
          ).toDateString()}`}</Text>
        ) : (
          <Skeleton height={11} width={200} radius={"xs"} />
        )}
      </Stack>
    </Card>
  );
};

export default memo(SummaryCard);