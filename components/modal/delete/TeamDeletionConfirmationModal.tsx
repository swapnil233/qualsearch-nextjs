import { Button, Group, Modal, Stack, Text, TextInput } from "@mantine/core";
import * as React from "react";

interface IDeleteConfirmationModalProps {
  opened: boolean;
  close: () => void;
  isDeleting: boolean;
  handleDelete: () => void;
  teamName: string;
}

const TeamDeletionConfirmationModal: React.FunctionComponent<
  IDeleteConfirmationModalProps
> = ({ opened, close, handleDelete, isDeleting, teamName }) => {
  const [inputValue, setInputValue] = React.useState("");

  // Disable the delete button unless the input matches the team name
  const isDeleteDisabled = inputValue !== teamName || isDeleting;

  return (
    <Modal
      opened={opened}
      onClose={close}
      title={`Permanently delete "${teamName}"`}
      centered
      padding={"lg"}
    >
      <Stack spacing={"xl"}>
        <Stack spacing={"xs"}>
          <Text>
            Deleting this team will permanently erase all associated projects
            and remove all members from the team.
          </Text>
          <TextInput
            label="To confirm deletion, type the team name below"
            placeholder={teamName}
            value={inputValue}
            onChange={(e) => setInputValue(e.currentTarget.value)}
            size="sm"
            radius={"xs"}
            required
          />
        </Stack>
        <Group position="apart">
          <Button variant="default" onClick={close}>
            Cancel
          </Button>
          <Button
            color="red"
            loading={isDeleting}
            onClick={handleDelete}
            disabled={isDeleteDisabled}
          >
            Permanently delete
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default TeamDeletionConfirmationModal;
