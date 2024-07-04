import {
  Avatar,
  Button,
  Divider,
  Group,
  Menu,
  Switch,
  Text,
  useMantineColorScheme,
} from "@mantine/core";
import {
  IconMoonStars,
  IconSettings,
  IconSun,
  IconUser,
} from "@tabler/icons-react";
import Link from "next/link";
import { FC } from "react";

interface MobileMenuProps {
  user: any;
  status: string;
  toggleDrawer: () => void;
  signIn: typeof import("next-auth/react").signIn;
  signOut: typeof import("next-auth/react").signOut;
}

const MobileMenu: FC<MobileMenuProps> = ({
  user,
  status,
  toggleDrawer,
  signIn,
  signOut,
}) => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <>
      <Group px={"sm"} w={"100%"}>
        <Switch
          checked={colorScheme === "dark"}
          onChange={() => toggleColorScheme()}
          size="md"
          onLabel={<IconSun color="white" size="1.25rem" stroke={1.5} />}
          offLabel={<IconMoonStars color="gray" size="1.25rem" stroke={1.5} />}
          className="sm:hidden"
        />
      </Group>

      {status === "authenticated" && (
        <>
          <Divider
            my="sm"
            color={colorScheme === "dark" ? "dark.5" : "gray.1"}
          />
          <Link
            href="/profile/"
            className="no-underline text-black"
            onClick={toggleDrawer}
          >
            <Group p={"sm"}>
              <Avatar
                src={user?.image || ""}
                alt={user?.name || "Profile picture"}
                radius="xl"
                size={32}
              />
              <div style={{ flex: 1 }}>
                <Text size="sm" fw={500}>
                  {user?.name}
                </Text>
                <Text color="dimmed" size="xs">
                  {user?.email}
                </Text>
              </div>
            </Group>
          </Link>
          <Menu>
            <Menu.Label>Profile</Menu.Label>
            <Link
              href="/profile/"
              onClick={toggleDrawer}
              className="no-underline"
            >
              <Menu.Item
                className="flex items-center h-full px-4 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                leftSection={<IconUser size="0.9rem" stroke={1.5} />}
              >
                My profile
              </Menu.Item>
            </Link>
            <Link
              href="/account/"
              onClick={toggleDrawer}
              className="no-underline"
            >
              <Menu.Item
                className="flex items-center h-full px-4 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                leftSection={<IconSettings size="0.9rem" stroke={1.5} />}
              >
                Account settings
              </Menu.Item>
            </Link>
          </Menu>
        </>
      )}

      <Divider my="sm" color={colorScheme === "dark" ? "dark.5" : "gray.1"} />

      <Menu>
        {status === "authenticated" && <Menu.Label>Navigate</Menu.Label>}
        <Link
          href="/"
          className="block px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={toggleDrawer}
        >
          Home
        </Link>
        <Link
          href="/teams"
          className="block px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={toggleDrawer}
        >
          Teams
        </Link>
      </Menu>

      <Divider my="sm" color={colorScheme === "dark" ? "dark.5" : "gray.1"} />
      <Group justify="center" grow pb="xl" px="md">
        {status === "authenticated" ? (
          <Button
            variant="light"
            color="red"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            Log out
          </Button>
        ) : (
          <Button
            variant="filled"
            onClick={() => signIn(undefined, { callbackUrl: "/teams" })}
          >
            Log in
          </Button>
        )}
      </Group>
    </>
  );
};

export default MobileMenu;
