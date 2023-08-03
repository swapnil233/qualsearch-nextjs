import { Button, Group, Modal, Text } from "@mantine/core";
import * as React from "react";

interface IDeleteConfirmationModalProps {
  opened: boolean;
  close: () => void;
  deleting: boolean;
  handleDelete: () => void;
}

const DeleteConfirmationModal: React.FunctionComponent<
  IDeleteConfirmationModalProps
> = ({ opened, close, handleDelete, deleting }) => {
  return (
    <Modal
      opened={opened}
      onClose={close}
      title={
        <Text fz="lg" fw={"bold"}>
          Are you sure?
        </Text>
      }
      centered
      padding={"lg"}
    >
      <Text>
        All projects and files will be deleted permenantly. Team members will be
        removed. <b>This action cannot be undone.</b>
      </Text>
      <Group position="apart" mt={"lg"}>
        <Button variant="outline" radius="xs" onClick={close} color="dark">
          Cancel
        </Button>
        <Button
          color="red"
          radius="xs"
          loading={deleting}
          onClick={handleDelete}
        >
          Yes, delete team
        </Button>
      </Group>
    </Modal>
  );
};

export default DeleteConfirmationModal;
