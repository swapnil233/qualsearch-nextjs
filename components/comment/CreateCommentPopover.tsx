import { Avatar, Box, Button, Group, Text, Textarea } from "@mantine/core";
import { User } from "@prisma/client";
import { FC, useState } from "react";

interface ICreateCommentPopover {
  user: User;
  onClose: () => void;
  onSubmit: (note: string) => void;
  position: { top: number; left: number };
}

export const CreateCommentPopover: FC<ICreateCommentPopover> = ({
  user,
  onClose,
  onSubmit,
  position,
}) => {
  const [newComment, setNewComment] = useState<string>("");
  return (
    <Box
      p={"md"}
      bg={"white"}
      sx={{
        position: "absolute",
        top: position.top,
        left: position.left,
        borderRadius: "5px",
        boxShadow: "0px 0px 10px rgba(0,0,0,0.1)",
      }}
    >
      <Group spacing={"sm"} mb={"md"}>
        <Avatar src={user.image || ""} alt={user.name || ""} radius="xl" />
        <Text fz="md">{user.name}</Text>
      </Group>
      <Textarea
        placeholder="Comment..."
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        minRows={6}
        w={300}
        mb="md"
      />
      <Group position="apart">
        <Button radius={"xs"} variant="default" onClick={onClose}>
          Cancel
        </Button>
        <Button
          radius={"xs"}
          onClick={() => {
            onSubmit(newComment);
            setNewComment("");
            onClose();
          }}
        >
          Post
        </Button>
      </Group>
    </Box>
  );
};
