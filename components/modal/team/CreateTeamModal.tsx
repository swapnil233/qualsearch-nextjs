import { Button, Group, Modal, TextInput, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { FC } from "react";

export interface ICreateTeamModal {
  opened: boolean;
  close: () => void;
  creating: boolean;
  form: ReturnType<
    typeof useForm<{ teamName: string; teamDescription: string }>
  >;
  handleCreateNewTeam: (
    _values: { teamName: string; teamDescription: string },
    _event: React.FormEvent
  ) => void;
}

const CreateTeamModal: FC<ICreateTeamModal> = ({
  opened,
  close,
  creating,
  form,
  handleCreateNewTeam,
}) => {
  return (
    <Modal
      opened={opened}
      onClose={close}
      title="Create new team"
      centered
      padding={"lg"}
    >
      <form onSubmit={form.onSubmit(handleCreateNewTeam)}>
        <TextInput
          placeholder="Acme UX team..."
          label="Team name"
          radius="xs"
          withAsterisk
          mb={"md"}
          {...form.getInputProps("teamName")}
        />

        <Textarea
          placeholder="This team is for..."
          label="Description"
          description="Optional field that helps identify the team"
          radius="xs"
          autosize
          minRows={4}
          mb={"md"}
          {...form.getInputProps("teamDescription")}
        />

        <Group position="apart">
          <Button variant="default" color="gray" radius="xs" onClick={close}>
            Cancel
          </Button>
          <Button radius="xs" type="submit" loading={creating}>
            Create team
          </Button>
        </Group>
      </form>
    </Modal>
  );
};

export default CreateTeamModal;
