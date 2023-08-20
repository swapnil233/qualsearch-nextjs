import {
  Avatar,
  Group,
  Paper,
  Stack,
  Text,
  TypographyStylesProvider,
} from "@mantine/core";
import { User } from "@prisma/client";
import { CommentType } from "../Transcript";

interface CommentHtmlProps {
  position: {
    top: number;
    left: number;
  };
  postedAt: string;
  body: CommentType;
  author: User;
}

export function CommentCard({
  position,
  postedAt,
  body,
  author,
}: CommentHtmlProps) {
  return (
    <Paper
      withBorder
      radius="md"
      p="md"
      top={position.top}
      left={position.left}
    >
      <Group align="flex-start">
        <Stack justify="flex-start" align="flex-start">
          <Avatar src={author.image} alt={author.name || ""} radius="xl" />
        </Stack>
        <Stack justify="flex-start">
          <Stack spacing={0}>
            <Text fz="md">{author.name}</Text>
            <Text fz="xs" c="dimmed">
              {postedAt}
            </Text>
          </Stack>
          <TypographyStylesProvider>
            <div dangerouslySetInnerHTML={{ __html: body.note }} />
          </TypographyStylesProvider>
        </Stack>
      </Group>
    </Paper>
  );
}
