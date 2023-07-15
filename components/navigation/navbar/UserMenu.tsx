// UserMenu.tsx
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
  IconSettings,
  IconSun,
  IconUser,
} from "@tabler/icons-react";
import { signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { FC, useState } from "react";
import { navbarStyles } from "./Navbar.styles";

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
  const { classes, cx } = navbarStyles();
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
            className={cx(classes.user, {
              [classes.userActive]: userMenuOpened,
            })}
          >
            <Group spacing={7}>
              <Avatar
                src={user?.image || ""}
                alt={
                  `${user?.name}'s profile picture` ||
                  `Placeholder profile picture for ${user?.name}`
                }
                radius="xl"
                size={32}
              />

              <Text weight={500} size="sm">
                {user?.name}
              </Text>
              <IconChevronDown size="1.2rem" />
            </Group>
          </UnstyledButton>
        </Menu.Target>
        <Menu.Dropdown>
          <Link href="/profile/" className="no-underline">
            <Menu.Item icon={<IconUser size="1.1rem" />}>My profile</Menu.Item>
          </Link>
          <Link href="/profile/settings" className="no-underline">
            <Menu.Item icon={<IconSettings size="1.1rem" />}>
              Account settings
            </Menu.Item>
          </Link>
          <Menu.Divider />
          <Menu.Item
            onClick={() => {
              signOut({ callbackUrl: "/" });
            }}
            icon={<IconLogout size="1.1rem" />}
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
      <Button onClick={() => signIn(undefined, { callbackUrl: "/teams" })}>
        Log in
      </Button>
    );
  }

  return (
    <>
      <Switch
        checked={colorScheme === "dark"}
        onChange={() => toggleColorScheme()}
        size="lg"
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
