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
import { IconPlus, IconX } from "@tabler/icons-react";
import { FC } from "react";

export interface Invitation {
  email: string;
  role: "guest" | "viewer" | "member" | "admin";
}

export interface INewInvitationModal {
  opened: boolean;
  close: () => void;
  inviting: boolean;
  form: ReturnType<typeof useForm<{ invitations: Invitation[] }>>;
  handleCreateNewInvitation: (
    _values: { invitations: Invitation[] },
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
  const roleOptions = [
    { value: "guest", label: "Guest" },
    { value: "viewer", label: "Viewer" },
    { value: "member", label: "Member" },
    { value: "admin", label: "Admin" },
  ];

  const addEmail = () => {
    const newInvitation: Invitation = { email: "", role: "member" };
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
          sx={{ flex: 1 }}
        />
      </Grid.Col>
      <Grid.Col span={1}>
        <Group spacing={4} noWrap>
          <Select
            data={roleOptions}
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
        <Text size={"lg"} weight={500}>
          Invite people to collaborate
        </Text>
      }
      centered
      padding="lg"
      size={"lg"}
    >
      <form onSubmit={form.onSubmit(handleCreateNewInvitation)}>
        <Stack>{invitationInputs}</Stack>
        <Box mt={rem(20)}>
          <Group position="apart" noWrap>
            <Button
              variant="white"
              radius="xs"
              onClick={addEmail}
              leftIcon={<IconPlus size={"1rem"} />}
            >
              Add more
            </Button>
            <Group noWrap>
              <Button variant="default" radius="xs" onClick={close}>
                Cancel
              </Button>
              <Button radius="xs" type="submit" loading={inviting}>
                Send Invitation
              </Button>
            </Group>
          </Group>
        </Box>
      </form>
    </Modal>
  );
};

export default NewInvitationModal;
