import { Button, Group, Modal, TextInput, Title, rem } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconAt } from "@tabler/icons-react";
import { FC } from "react";

export interface INewInvitationModal {
  opened: boolean;
  close: () => void;
  inviting: boolean;
  form: ReturnType<typeof useForm<{ invitedEmail: string }>>;
  handleCreateNewInvitation: (
    _values: { invitedEmail: string },
    _event: React.FormEvent
  ) => void;
}

const NewInvitationModal: FC<INewInvitationModal> = ({
  opened,
  close,
  inviting,
  form,
  handleCreateNewInvitation,
}) => {
  return (
    <Modal
      opened={opened}
      onClose={close}
      title={<Title order={3}>Invite a new member</Title>}
      centered
      padding={"lg"}
    >
      <form onSubmit={form.onSubmit(handleCreateNewInvitation)}>
        <TextInput
          placeholder="john@example.com"
          label="Email"
          icon={<IconAt size="0.8rem" />}
          radius="xs"
          withAsterisk
          mb={rem(20)}
          size="md"
          {...form.getInputProps("invitedEmail")}
        />

        <Group position="apart">
          <Button variant="subtle" radius="xs" onClick={close}>
            Cancel
          </Button>
          <Button radius="xs" type="submit" loading={inviting}>
            Invite
          </Button>
        </Group>
      </form>
    </Modal>
  );
};

export default NewInvitationModal;
