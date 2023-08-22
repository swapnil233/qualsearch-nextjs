import { Avatar, Box, Group, Paper, Stack, Text } from "@mantine/core";
import { User } from "@prisma/client";

export type CommentType = {
  start: number;
  end: number;
  note: string;
  position: { top: number; left: number };
};

interface ICommentCardProps {
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
}: ICommentCardProps) {
  return (
    <Box
      w={400}
      sx={{
        position: "absolute",
        top: position.top,
        left: position.left,
        zIndex: 10,
      }}
    >
      <Paper
        withBorder
        radius="md"
        p="sm"
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
            <Text fz={"sm"}>{body.note}</Text>
          </Stack>
        </Group>
      </Paper>
    </Box>
  );
}
