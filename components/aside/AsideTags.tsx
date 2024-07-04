import { TagWithNoteIds } from "@/types";
import {
  Badge,
  Button,
  Card,
  Divider,
  Group,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { User } from "@prisma/client";
import { IconX } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useState } from "react";

interface IAsideTags {
  tags: TagWithNoteIds[];
  setTags: React.Dispatch<React.SetStateAction<TagWithNoteIds[]>>;
  projectId: string;
  user: User;
}

export const AsideTags: React.FC<IAsideTags> = ({
  tags,
  setTags,
  projectId,
  user,
}) => {
  const [newTagName, setNewTag] = useState<string>("");
  const [newTagIsCreating, setNewTagIsCreating] = useState<boolean>(false);

  const handleNewTagCreate = useCallback(async () => {
    if (!newTagName) {
      return;
    }

    setNewTagIsCreating(true);
    const newTagRes = await fetch("/api/tags", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        newTagNames: [newTagName],
        projectId: projectId,
        createdByUserId: user.id,
      }),
    });

    if (newTagRes.status === 409) {
      notifications.show({
        withCloseButton: true,
        autoClose: 5000,
        title: "That tag already exists",
        message: "Try creating a new tag with a different name.",
        color: "red",
        icon: <IconX />,
        loading: false,
      });

      setNewTag("");
      setNewTagIsCreating(false);
    } else if (newTagRes.status !== 201) {
      notifications.show({
        withCloseButton: true,
        autoClose: 5000,
        title: "Something went wrong",
        message: "Try again later.",
        color: "red",
        icon: <IconX />,
        loading: false,
      });

      setNewTag("");
      setNewTagIsCreating(false);
    }

    const newTagData: TagWithNoteIds[] = await newTagRes.json();

    setTags((prevTags) => [...prevTags, newTagData[0]]);

    setNewTag("");
    setNewTagIsCreating(false);
  }, [newTagName, projectId, setTags, user.id]);

  const router = useRouter();
  const { teamId } = router.query;

  return (
    <Stack>
      <Card withBorder title="d">
        <Stack>
          <Text fw={500}>Create new tag</Text>
          <Group gap={"xs"} wrap="nowrap">
            <TextInput
              size="sm"
              placeholder="Tag name"
              value={newTagName}
              onChange={(e) => setNewTag(e.currentTarget.value)}
            />
            <Button
              size="sm"
              onClick={handleNewTagCreate}
              loading={newTagIsCreating}
            >
              Create
            </Button>
          </Group>
        </Stack>
      </Card>
      <Card withBorder>
        <Stack>
          <Text fw={500}>Tags repository ({tags.length} tags)</Text>
          <Group gap={"xs"}>
            {tags.map((tag) => (
              <Link
                href={`/teams/${teamId}/projects/${projectId}/tags/${tag.id}`}
                key={tag.id}
              >
                <Badge variant="filled">{tag.name}</Badge>
              </Link>
            ))}
          </Group>
        </Stack>
        <Divider mt={"md"} mb={"md"} />
      </Card>
    </Stack>
  );
};
