import {
  Button,
  FileInput,
  Group,
  Modal,
  TextInput,
  Textarea,
  Title,
  rem,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { FC } from "react";

export interface ICreateFileModal {
  opened: boolean;
  close: () => void;
  creating: boolean;
  form: ReturnType<
    typeof useForm<{
      fileName: string;
      fileDescription: string;
      file: File | null;
    }>
  >;

  handleCreateNewFile: (
    _values: {
      fileName: string;
      fileDescription: string;
      file: File | null;
    },
    _event: React.FormEvent
  ) => void;
}

const CreateFileModal: FC<ICreateFileModal> = ({
  opened,
  close,
  creating,
  form,
  handleCreateNewFile,
}) => {
  return (
    <Modal
      opened={opened}
      onClose={close}
      title={<Title order={3}>Create a new Project</Title>}
      centered
      padding={"lg"}
    >
      <form onSubmit={form.onSubmit(handleCreateNewFile)}>
        <TextInput
          placeholder="John Doe's User Interview"
          label="File name"
          description="The file's name will appear in the project report"
          radius="xs"
          withAsterisk
          mb={rem(20)}
          size="md"
          {...form.getInputProps("fileName")}
        />

        <Textarea
          placeholder="This interview was conducted on..."
          label="Description"
          description="The file's description will appear in the project report"
          radius="xs"
          size="md"
          autosize
          minRows={4}
          mb={rem(20)}
          {...form.getInputProps("fileDescription")}
        />

        <FileInput
          placeholder="Select a file..."
          label="File"
          accept="*/*"
          value={form.values.file}
          onChange={(file) => form.setFieldValue("file", file)}
          required
          mb={rem(20)}
        />

        <Group position="apart">
          <Button variant="subtle" radius="xs" onClick={close}>
            Cancel
          </Button>
          <Button radius="xs" type="submit" loading={creating}>
            Create
          </Button>
        </Group>
      </form>
    </Modal>
  );
};

export default CreateFileModal;
