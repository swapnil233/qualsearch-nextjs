import { Button, Group, Modal, TextInput, Textarea } from "@mantine/core";
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
      title="Create new project"
      centered
      padding={"lg"}
    >
      <form onSubmit={form.onSubmit(handleCreateNewProject)}>
        <TextInput
          label="Project name"
          placeholder="ABC App Modernization"
          radius="xs"
          withAsterisk
          mb={"md"}
          {...form.getInputProps("projectName")}
        />

        <Textarea
          label="Description"
          description="This will appear in the project report. Can be changed later."
          placeholder="This project is about..."
          radius="xs"
          autosize
          minRows={4}
          mb={"md"}
          {...form.getInputProps("projectDescription")}
        />

        <Group position="apart">
          <Button variant="default" color="gray" radius="xs" onClick={close}>
            Cancel
          </Button>
          <Button radius="xs" type="submit" loading={creating}>
            Create project
          </Button>
        </Group>
      </form>
    </Modal>
  );
};

export default CreateProjectModal;
