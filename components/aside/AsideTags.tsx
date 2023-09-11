import { TagWithNotes } from "@/types";
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
import { IconDownload, IconUpload, IconX } from "@tabler/icons-react";
import { useCallback, useState } from "react";

interface IAsideTags {
  tags: TagWithNotes[];
  setTags: React.Dispatch<React.SetStateAction<TagWithNotes[]>>;
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

    const newTagData: TagWithNotes[] = await newTagRes.json();

    setTags((prevTags) => [...prevTags, newTagData[0]]);

    setNewTag("");
    setNewTagIsCreating(false);
  }, [newTagName, projectId, setTags, user.id]);

  return (
    <Stack>
      <Stack>
        <Card withBorder title="d">
          <Stack>
            <Text weight={500}>Create new tag</Text>
            <Group spacing={"xs"} noWrap>
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
      </Stack>
      <Stack>
        <Card withBorder title="d">
          <Stack>
            <Text weight={500}>Tags repository ({tags.length} tags)</Text>
            <Group spacing={"xs"}>
              {tags.map((tag) => (
                <Badge key={tag.id} variant="filled">
                  {tag.name}
                </Badge>
              ))}
            </Group>
          </Stack>
          <Divider mt={"md"} mb={"md"} />
          {/* @TODO implement import and export features */}
          <Group position="apart">
            <Button
              compact
              variant="subtle"
              leftIcon={<IconUpload size={16} />}
            >
              Import
            </Button>
            <Button
              compact
              variant="subtle"
              leftIcon={<IconDownload size={16} />}
            >
              Export
            </Button>
          </Group>
        </Card>
      </Stack>
    </Stack>
  );
};
