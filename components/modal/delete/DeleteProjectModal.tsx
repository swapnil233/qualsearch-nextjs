import { Button, Group, Modal, Text } from "@mantine/core";
import { FC } from "react";

interface IDeleteProjectModal {
  opened: boolean;
  close: () => void;
  deleting: boolean;
  handleDelete: () => void;
}

const DeleteProjectModal: FC<IDeleteProjectModal> = ({
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
          Delete this project?
        </Text>
      }
      centered
      padding={"lg"}
    >
      <Text>
        This project will be removed from the team and any places it has been
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

export default DeleteProjectModal;
