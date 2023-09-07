import {
  Button,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
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
      title={<Title order={4}>Permanently delete team</Title>}
      variant=""
      centered
      padding={"lg"}
    >
      <Stack spacing={"xl"}>
        <Stack>
          <Text>
            This will permanently erase all associated projects and files, and
            remove all members from the team. You will not be able to recover
            any of this data.
          </Text>
          <TextInput
            label="To confirm deletion, type the team name below"
            placeholder={teamName}
            value={inputValue}
            onChange={(e) => setInputValue(e.currentTarget.value)}
            size="sm"
            sx={{
              fontStyle: "italic",
            }}
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
