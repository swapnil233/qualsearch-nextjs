import {
  Button,
  Group,
  Modal,
  TextInput,
  Textarea,
  Title,
  rem,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { FC } from "react";

export interface ICreateProjectModal {
  opened: boolean;
  close: () => void;
  creating: boolean;
  form: ReturnType<
    typeof useForm<{ projectName: string; projectDescription: string }>
  >;
  handleCreateNewProject: (
    _values: { projectName: string; projectDescription: string },
    _event: React.FormEvent
  ) => void;
}

const CreateProjectModal: FC<ICreateProjectModal> = ({
  opened,
  close,
  creating,
  form,
  handleCreateNewProject,
}) => {
  return (
    <Modal
      opened={opened}
      onClose={close}
      title={<Title order={3}>Create a new Project</Title>}
      centered
      padding={"lg"}
    >
      <form onSubmit={form.onSubmit(handleCreateNewProject)}>
        <TextInput
          placeholder="Acme Usability Tests..."
          label="Project name"
          description="This name can be changed later in project settings"
          radius="xs"
          withAsterisk
          mb={rem(20)}
          size="md"
          {...form.getInputProps("projectName")}
        />

        <Textarea
          placeholder="This project is about..."
          label="Description"
          description="The project's description will appear in the project report"
          radius="xs"
          size="md"
          autosize
          minRows={4}
          mb={rem(20)}
          {...form.getInputProps("projectDescription")}
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

export default CreateProjectModal;
