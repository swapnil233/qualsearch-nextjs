import { ICreateInvitationsPayload } from "@/infrastructure/services/invitation.service";
import {
  ActionIcon,
  Box,
  Button,
  Grid,
  Group,
  Modal,
  Select,
  Stack,
  Text,
  TextInput,
  rem,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { Role } from "@prisma/client";
import { IconPlus, IconX } from "@tabler/icons-react";
import { FC } from "react";

export interface INewInvitationModal {
  opened: boolean;
  close: () => void;
  inviting: boolean;
  form: ReturnType<
    typeof useForm<{ invitations: ICreateInvitationsPayload[] }>
  >;
  handleCreateNewInvitation: (
    _values: { invitations: ICreateInvitationsPayload[] },
    _event?: React.FormEvent<HTMLFormElement>
  ) => void;
}

const NewInvitationModal: FC<INewInvitationModal> = ({
  opened,
  close,
  inviting,
  form,
  handleCreateNewInvitation,
}) => {
  const roleOptions: [
    { value: Role; label: string },
    { value: Role; label: string },
    { value: Role; label: string },
    { value: Role; label: string },
  ] = [
    { value: "GUEST", label: "Guest" },
    { value: "VIEWER", label: "Viewer" },
    { value: "MEMBER", label: "Member" },
    { value: "ADMIN", label: "Admin" },
  ];

  const addEmail = () => {
    const newInvitation: ICreateInvitationsPayload = {
      email: "",
      role: "MEMBER",
    };
    form.insertListItem("invitations", newInvitation);
  };

  const removeEmail = (index: number) => {
    form.removeListItem("invitations", index);
  };

  const invitationInputs = form.values.invitations.map((invitation, index) => (
    <Grid key={index} gutter="xs" grow>
      <Grid.Col span={6}>
        <TextInput
          placeholder="Enter an email..."
          {...form.getInputProps(`invitations.${index}.email`)}
          required
          type="email"
          aria-label="Email"
        />
      </Grid.Col>
      <Grid.Col span={1}>
        <Group gap={4} wrap="nowrap" align="center">
          <Select
            data={roleOptions}
            aria-label="Role"
            {...form.getInputProps(`invitations.${index}.role`)}
          />
          {form.values.invitations.length > 1 && (
            <ActionIcon onClick={() => removeEmail(index)}>
              <IconX size={16} />
            </ActionIcon>
          )}
        </Group>
      </Grid.Col>
    </Grid>
  ));

  return (
    <Modal
      opened={opened}
      onClose={close}
      title={
        <Text size={"lg"} fw={500}>
          Invite people to collaborate
        </Text>
      }
      centered
      padding="lg"
      size={"lg"}
    >
      <form
        onSubmit={form.onSubmit((values, event) =>
          handleCreateNewInvitation(
            values,
            event as React.FormEvent<HTMLFormElement>
          )
        )}
      >
        <Stack>{invitationInputs}</Stack>
        <Box mt={rem(20)}>
          <Group justify="space-between" wrap="nowrap">
            <Button
              variant="white"
              radius="xs"
              onClick={addEmail}
              leftSection={<IconPlus size={"1rem"} />}
            >
              Add more
            </Button>
            <Group wrap="nowrap">
              <Button variant="default" radius="xs" onClick={close}>
                Cancel
              </Button>
              <Button radius="xs" type="submit" loading={inviting}>
                Send Invitation{form.values.invitations.length > 1 && "s"}
              </Button>
            </Group>
          </Group>
        </Box>
      </form>
    </Modal>
  );
};

export default NewInvitationModal;
