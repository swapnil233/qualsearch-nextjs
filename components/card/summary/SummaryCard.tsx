import { Card, Skeleton, Stack, Text, Title } from "@mantine/core";
import { FC, memo } from "react";

export interface ISummaryCard {
  summary: String;
  dateSummarized: Date | string;
}

const SummaryCard: FC<ISummaryCard> = ({ summary, dateSummarized }) => {
  // Parse the bolds returned by AI (in **)
  const parseMarkdown = (text: string) => {
    const parts = text.split("**");
    return parts.map((part: string, i: number) =>
      i % 2 === 0 ? part : <strong key={i}>{part}</strong>
    );
  };

  return (
    <Card
      withBorder
      radius="sm"
      sx={(theme) => ({
        backgroundColor:
          theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.white,
      })}
    >
      <Stack spacing={"xl"}>
        <Stack spacing={"md"}>
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
