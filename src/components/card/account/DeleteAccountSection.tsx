// In DeleteAccount.tsx
import DeleteAccountModal from "@/components/modal/delete/DeleteAccountModal";
import { Card, Grid, Group, Stack, Text } from "@mantine/core";

interface DeleteAccountSectionProps {
  handleDeleteAccount: () => void;
  isLoading: boolean;
}

const DeleteAccountSection = ({
  handleDeleteAccount,
  isLoading,
}: DeleteAccountSectionProps) => {
  return (
    <Grid gutter="xl">
      <Grid.Col span={{ base: 12, md: 4 }}>
        <Stack gap="xs">
          <Text fw={500} size="lg" c="#333333">
            Delete account
          </Text>
          <Text c="#7D7D7D">Deleting your account is irreversible.</Text>
        </Stack>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 8 }}>
        <Card radius="md" withBorder p={0}>
          <Group px={{ base: 16, md: 32 }} py={{ base: 16, md: 32 }}>
            <DeleteAccountModal
              onConfirm={handleDeleteAccount}
              isLoading={isLoading}
            />
          </Group>
        </Card>
      </Grid.Col>
    </Grid>
  );
};

export default DeleteAccountSection;
