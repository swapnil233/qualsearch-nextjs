import { TagWithNoteIds } from "@/types";
import {
  Avatar,
  Box,
  Button,
  Group,
  Stack,
  TagsInput,
  Text,
  Textarea,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { User } from "@prisma/client";
import { IconTag } from "@tabler/icons-react";
import { FC, useEffect, useState } from "react";

interface CreateNotePopoverProps {
  user: User;
  tags: TagWithNoteIds[];
  onClose: () => void;
  noteIsCreating: boolean;
  onSubmit: (
    _note: string,
    _selectedTagIds: string[],
    _newTagNames: string[]
  ) => void;
  position: { top: number; left: number };
}

interface FormValues {
  note: string;
  tags: string[]; // Array of selected tag IDs
}

type TagsInputOption = {
  value: string; // tag ID
  label: string; // tag name
};

export const CreateNotePopover: FC<CreateNotePopoverProps> = ({
  user,
  tags,
  onClose,
  noteIsCreating,
  onSubmit,
  position,
}) => {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();

  // Holds the tags that can be selected in the TagsInput component (ID and name pairs).
  const [selectableTags, setSelectableTags] = useState<TagsInputOption[]>([]);

  // Holds names of new tags created by the user that do not already exist in 'tags'.
  const [newTagNames, setNewTagNames] = useState<string[]>([]);

  // Transform the tags prop into a format suitable for the TagsInput component.
  useEffect(() => {
    const populateSelectableTags = () => {
      const uniqueTags = new Set<string>();
      const transformedTags = tags
        .map((tag) => ({
          label: tag.name,
          value: tag.id,
        }))
        .filter((tag) => {
          // Ensure each tag is unique by its ID
          if (!uniqueTags.has(tag.value)) {
            uniqueTags.add(tag.value);
            return true;
          }
          return false;
        });
      setSelectableTags(transformedTags);
    };

    populateSelectableTags();
  }, [tags]);

  // Form for creating a new note.
  const form = useForm<FormValues>({
    initialValues: {
      note: "",
      tags: [], // Initially no tags are selected
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
            onSubmit(values.note, values.tags, newTagNames)
          )}
        >
          <Stack mb={"lg"}>
            <Textarea
              {...form.getInputProps("note")}
              placeholder="E.g., The user found the report creation process confusing..."
              label="Note"
              minRows={4}
              resize="vertical"
              required
            />

            {/* TagsInput for selecting or creating tags */}
            <TagsInput
              value={form.values.tags}
              onChange={(selectedTags) => {
                // Update the form with the selected tag IDs
                form.setFieldValue("tags", selectedTags);

                // Detect new tag names that aren't part of existing tags
                const newTagsFromInput = selectedTags.filter(
                  (tagId) =>
                    !selectableTags.some((option) => option.value === tagId)
                );
                setNewTagNames(newTagsFromInput);
              }}
              label="Select or create tags"
              data={selectableTags}
              clearable
              description="Press Enter to create a new tag, or select an existing one."
              leftSection={<IconTag size={"1.1rem"} />}
              placeholder="Enter or select tags"
            />
          </Stack>

          {/* Action buttons for cancelling or submitting the note */}
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
