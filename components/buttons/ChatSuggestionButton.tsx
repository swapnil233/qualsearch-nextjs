import { Card, Group, Text, UnstyledButton } from "@mantine/core";
import { IconSend } from "@tabler/icons-react";
import { FC, FormEvent } from "react";

interface IChatSuggestionButtonProps {
  suggestion: string;
  handleSubmit: (_e: FormEvent) => Promise<void>;
}

const ChatSuggestionButton: FC<IChatSuggestionButtonProps> = ({
  suggestion,
  handleSubmit,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    handleSubmit(e as unknown as FormEvent);
  };

  return (
    <UnstyledButton onClick={handleClick}>
      <Card padding="xs" style={{ cursor: "pointer" }} withBorder>
        <Group noWrap position="apart">
          <Text size="sm">{suggestion}</Text>
          <IconSend size={"1rem"} />
        </Group>
      </Card>
    </UnstyledButton>
  );
};

export default ChatSuggestionButton;
