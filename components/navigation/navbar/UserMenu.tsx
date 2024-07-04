import {
  Avatar,
  Button,
  Group,
  Loader,
  Menu,
  Switch,
  Text,
  UnstyledButton,
  useMantineTheme,
} from "@mantine/core";
import {
  IconChevronDown,
  IconLogout,
  IconMoonStars,
  IconSun,
  IconUser,
  IconUsersGroup,
} from "@tabler/icons-react";
import { signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { FC, useState } from "react";

interface IUserMenuProps {
  user: any;
  colorScheme: string;
  toggleColorScheme: () => void;
  status: string;
}

const UserMenu: FC<IUserMenuProps> = ({
  user,
  colorScheme,
  toggleColorScheme,
  status,
}) => {
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const theme = useMantineTheme();

  // User menu: menu | loader | "Log in"
  let userMenu;

  if (status === "authenticated") {
    userMenu = (
      <Menu
        width={260}
        position="bottom-end"
        transitionProps={{ transition: "pop-top-right" }}
        onClose={() => setUserMenuOpened(false)}
        onOpen={() => setUserMenuOpened(true)}
        withinPortal
      >
        <Menu.Target>
          {/* User button */}
          <UnstyledButton
            className={`flex items-center p-2 rounded-sm transition-colors ${
              userMenuOpened
                ? colorScheme === "dark"
                  ? "bg-gray-800"
                  : "bg-white"
                : ""
            }`}
          >
            <Group gap={7}>
              <Avatar
                src={user?.image || ""}
                alt={
                  `${user?.name}'s profile picture` ||
                  `Placeholder profile picture for ${user?.name}`
                }
                radius="xl"
                size={32}
              />

              <Text fw={500} size="sm">
                {user?.name}
              </Text>
              <IconChevronDown size="1.2rem" />
            </Group>
          </UnstyledButton>
        </Menu.Target>
        <Menu.Dropdown>
          <Link href="/teams" className="no-underline">
            <Menu.Item
              leftSection={<IconUsersGroup size="1.1rem" />}
              color={colorScheme === "dark" ? theme.white : theme.black}
            >
              Teams
            </Menu.Item>
          </Link>
          <Link href="/account/" className="no-underline">
            <Menu.Item
              leftSection={<IconUser size="1.1rem" />}
              color={colorScheme === "dark" ? theme.white : theme.black}
            >
              Account
            </Menu.Item>
          </Link>
          <Menu.Divider />
          <Menu.Item
            onClick={() => {
              signOut({ callbackUrl: "/" });
            }}
            leftSection={<IconLogout size="1.1rem" />}
            color={colorScheme === "dark" ? theme.white : theme.black}
          >
            Log out
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    );
  } else if (status === "loading") {
    userMenu = <Loader size={"sm"} />;
  } else if (status === "unauthenticated") {
    userMenu = (
      <Group>
        <Button
          onClick={() => signIn(undefined, { callbackUrl: "/teams" })}
          variant="default"
          component="a"
          href="signin"
        >
          Sign in
        </Button>
        <Link href="register">
          <Button variant="filled">Sign up</Button>
        </Link>
      </Group>
    );
  }

  return (
    <>
      <Switch
        checked={colorScheme === "dark"}
        onChange={() => toggleColorScheme()}
        size="md"
        onLabel={<IconSun color={theme.white} size="1.25rem" stroke={1.5} />}
        offLabel={
          <IconMoonStars
            color={theme.colors.gray[6]}
            size="1.25rem"
            stroke={1.5}
          />
        }
      />
      {userMenu}
    </>
  );
};

export default UserMenu;
