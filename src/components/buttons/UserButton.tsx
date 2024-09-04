import { Avatar, UnstyledButton } from "@mantine/core";
import { forwardRef } from "react";

interface UserButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  image: string;
}

const UserButton = forwardRef<HTMLButtonElement, UserButtonProps>(
  ({ image, ...others }, ref) => {
    return (
      <UnstyledButton ref={ref} {...others}>
        <Avatar src={image} radius="xl" />
      </UnstyledButton>
    );
  }
);

// eslint complains otherwise
UserButton.displayName = "UserButton";

export default UserButton;
