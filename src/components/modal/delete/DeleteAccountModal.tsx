import { Button, Group, Modal, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

interface DeleteAccountModalProps {
  onConfirm: () => void;
  isLoading: boolean;
}

const DeleteAccountModal = ({
  onConfirm,
  isLoading,
}: DeleteAccountModalProps) => {
  const [opened, { open, close }] = useDisclosure(false);

  const handleConfirm = () => {
    onConfirm();
    close();
  };

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        title="Confirm Account Deletion"
        centered
      >
        <Text>
          Are you sure you want to delete your account? This action is
          irreversible.
        </Text>
        <Group justify="right" mt="md">
          <Button variant="default" onClick={close}>
            Cancel
          </Button>
          <Button color="red" onClick={handleConfirm} loading={isLoading}>
            Delete
          </Button>
        </Group>
      </Modal>

      <Button color="red" onClick={open}>
        Delete my account
      </Button>
    </>
  );
};

export default DeleteAccountModal;
