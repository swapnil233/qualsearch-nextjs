import {
  Avatar,
  Group,
  Menu,
  Skeleton,
  Text,
  UnstyledButton,
  UnstyledButtonProps,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import {
  IconArrowsUpDown,
  IconLogout,
  IconSettings,
  IconUser,
} from "@tabler/icons-react";
import { signOut } from "next-auth/react";
import Link from "next/link";

interface UserButtonProps extends UnstyledButtonProps {
  image: string | undefined | null;
  name?: string | undefined | null;
  email?: string | undefined | null;
  icon?: React.ReactNode;
}

export function UserButton({
  image,
  name,
  email,
  icon,
  ...others
}: UserButtonProps) {
  const { colorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();
  const textColor = colorScheme === "dark" ? "text-white" : "text-black";
  const hoverBgColor =
    colorScheme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-200";

  return (
    <Menu shadow="md" width={200} position="right-end">
      <Menu.Target>
        <UnstyledButton
          className={`block w-full p-md ${textColor} ${hoverBgColor}`}
          {...others}
        >
          <Group>
            {image !== undefined && image !== null ? (
              <Avatar src={image} radius="xl" />
            ) : (
              <Skeleton height={40} circle />
            )}

            <div style={{ flex: 1 }}>
              {name !== undefined ? (
                <Text size="sm" fw={500}>
                  {name}
                </Text>
              ) : (
                <Skeleton
                  width={120}
                  height={8}
                  animate
                  radius={"xs"}
                  mb={"xs"}
                />
              )}

              {email !== undefined ? (
                <Text color="dimmed" size="xs">
                  {email}
                </Text>
              ) : (
                <Skeleton width={80} height={8} animate radius={"xs"} />
              )}
            </div>

            {icon || <IconArrowsUpDown size="0.9rem" stroke={1.5} />}
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Link href="/profile/" className="no-underline">
          <Menu.Item
            leftSection={<IconUser size="1.1rem" />}
            className={textColor}
          >
            My profile
          </Menu.Item>
        </Link>
        <Link href="/profile/settings" className="no-underline">
          <Menu.Item
            leftSection={<IconSettings size="1.1rem" />}
            className={textColor}
          >
            Account settings
          </Menu.Item>
        </Link>
        <Menu.Divider />
        <Menu.Item
          onClick={() => {
            signOut({ callbackUrl: "/" });
          }}
          leftSection={<IconLogout size="1.1rem" />}
          className={textColor}
        >
          Log out
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
