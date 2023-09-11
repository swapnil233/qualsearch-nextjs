import { Button, Image, Stack, Text, Title } from "@mantine/core";
import { FC, ReactNode } from "react";

export interface IEmptyState {
  title: string;
  description: string;
  imageUrl: string;
  primaryButtonText?: string;
  primaryButtonAction?: () => void;
  primaryButtonIcon?: ReactNode;
}

const EmptyState: FC<IEmptyState> = ({
  title,
  description,
  primaryButtonAction,
  primaryButtonIcon,
  primaryButtonText,
  imageUrl,
}) => {
  return (
    <Stack w={"100%"} align="center" mt="1rem">
      <Image
        src={imageUrl}
        maw={225}
        alt="Illustration of an empty state. This is a placeholder image for when there are no items."
        withPlaceholder
      />
      <Stack spacing={"xs"} ta={"center"}>
        <Title order={3}>{title}</Title>
        <Text maw={"25rem"}>{description}</Text>
      </Stack>
      {primaryButtonAction && (
        <Button leftIcon={primaryButtonIcon} onClick={primaryButtonAction}>
          {primaryButtonText}
        </Button>
      )}
    </Stack>
  );
};

export default EmptyState;
