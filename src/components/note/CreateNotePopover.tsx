import { TagWithNoteIds } from "@/types";
import {
  Avatar,
  Box,
  Button,
  Group,
  MultiSelect,
  Stack,
  Text,
  Textarea,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { User } from "@prisma/client";
import { IconTag } from "@tabler/icons-react";
import { FC, useEffect, useState } from "react";

interface ICreateNotePopover {
  user: User;
  tags: TagWithNoteIds[];
  onClose: () => void;
  noteIsCreating: boolean;
  onSubmit: (_note: string, _tags: string[], _newTags: string[]) => void;
  position: { top: number; left: number };
}

interface IFormValues {
  note: string;
  tags: string[];
}

type MultiSelectData = {
  // values are IDs
  value: string;

  // labels are the names
  label: string;
};

export const CreateNotePopover: FC<ICreateNotePopover> = ({
  user,
  tags,
  onClose,
  noteIsCreating,
  onSubmit,
  position,
}) => {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();

  const [multiSelectDataset, setMultiSelectDataset] = useState<
    MultiSelectData[]
  >([]);

  // Array of just the new tag's names
  const [newTags, setNewTags] = useState<string[]>([]);

  // Iterate through tags prop, transform each to multiSelectDataset
  useEffect(() => {
    const transformTags = () => {
      tags.map((tag) => {
        setMultiSelectDataset((prevTags) => [
          ...prevTags,
          {
            label: tag.name,
            value: tag.id,
          },
        ]);
      });
    };

    transformTags();
  }, [tags]);

  // Form for the note creation submission.
  const form = useForm<IFormValues>({
    initialValues: {
      note: "",
      tags: [],
    },
  });

  return (
    <Box
      p={"md"}
      bg={colorScheme === "light" ? theme.white : "dark.9"}
      w={350}
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        borderRadius: "5px",
        boxShadow: "0px 0px 10px rgba(0,0,0,0.1)",
      }}
    >
      <Stack>
        <Group gap={"sm"}>
          <Avatar src={user.image || ""} alt={user.name || ""} radius="xl" />
          <Text fz="md">{user.name}</Text>
        </Group>
        <form
          onSubmit={form.onSubmit((values) =>
            onSubmit(values.note, values.tags, newTags)
          )}
        >
          <Stack mb={"lg"}>
            <Textarea
              {...form.getInputProps("note")}
              placeholder="E.g., The user found the report creation process confusing..."
              label="Note"
              minRows={3}
            />
            <MultiSelect
              {...form.getInputProps("tags")}
              label="Select tags"
              data={multiSelectDataset}
              // clearSearchOnBlur
              searchable
              clearable
              leftSection={<IconTag size={"1.1rem"} />}
              // creatable
              // getCreateLabel={(query: any) => `+ Create ${query}`}
              // onCreate={(query: any) => {
              //   const item = { value: query, label: query };
              //   setNewTags((prevTags) => [...prevTags, query]);
              //   setMultiSelectDataset((current) => [...current, item]);

              //   return item;
              // }}
            />
          </Stack>

          <Group justify="space-between">
            <Button
              disabled={noteIsCreating}
              radius={"xs"}
              variant="default"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button loading={noteIsCreating} type="submit" radius={"xs"}>
              Post
            </Button>
          </Group>
        </form>
      </Stack>
    </Box>
  );
};
