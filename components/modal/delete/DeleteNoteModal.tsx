import { Button, Group, Modal, Text } from "@mantine/core";
import * as React from "react";

interface IDeleteNoteModal {
  opened: boolean;
  close: () => void;
  deleting: boolean;
  handleDelete: () => void;
}

const DeleteNoteModal: React.FunctionComponent<IDeleteNoteModal> = ({
  opened,
  close,
  handleDelete,
  deleting,
}) => {
  return (
    <Modal
      opened={opened}
      onClose={close}
      title={
        <Text fz="lg" fw={500}>
          Delete this note?
        </Text>
      }
      centered
      padding={"lg"}
    >
      <Text>
        This note will be removed from the project and any places it has been
        shared or added to. <b>This action cannot be undone.</b>
      </Text>
      <Group justify="space-between" mt={"lg"}>
        <Button variant="outline" radius="xs" onClick={close} color="dark">
          Cancel
        </Button>
        <Button
          color="red"
          radius="xs"
          loading={deleting}
          onClick={handleDelete}
        >
          Delete
        </Button>
      </Group>
    </Modal>
  );
};

export default DeleteNoteModal;
