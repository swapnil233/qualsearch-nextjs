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
      title={<Title order={3}>Create a new team</Title>}
      centered
      padding={"lg"}
    >
      <form onSubmit={form.onSubmit(handleCreateNewTeam)}>
        <TextInput
          placeholder="Acme UX team..."
          label="Team name"
          description="This name can be changed later in team settings"
          radius="xs"
          withAsterisk
          mb={rem(20)}
          size="md"
          {...form.getInputProps("teamName")}
        />

        <Textarea
          placeholder="This team is for..."
          label="Description"
          description="A description will help your team members identify the team"
          radius="xs"
          size="md"
          autosize
          minRows={4}
          mb={rem(20)}
          {...form.getInputProps("teamDescription")}
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

export default CreateTeamModal;
