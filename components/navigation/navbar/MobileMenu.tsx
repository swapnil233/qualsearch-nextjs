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
import { navbarStyles } from "./Navbar.styles";

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
  const { classes, theme } = navbarStyles();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <>
      <Group px={"sm"} w={"100%"}>
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
          className={classes.hiddenDesktop}
        />
      </Group>

      {status === "authenticated" && (
        <>
          <Divider
            my="sm"
            color={theme.colorScheme === "dark" ? "dark.5" : "gray.1"}
          />
          <Link
            href="/profile/"
            style={{ textDecoration: "none", color: "black" }}
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
                <Text size="sm" weight={500}>
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
                className={classes.link}
                icon={<IconUser size="0.9rem" stroke={1.5} />}
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
                className={classes.link}
                icon={<IconSettings size="0.9rem" stroke={1.5} />}
              >
                Account settings
              </Menu.Item>
            </Link>
          </Menu>
        </>
      )}

      <Divider
        my="sm"
        color={theme.colorScheme === "dark" ? "dark.5" : "gray.1"}
      />

      <Menu>
        {status === "authenticated" && <Menu.Label>Navigate</Menu.Label>}
        <Link href="/" className={classes.link} onClick={toggleDrawer}>
          Home
        </Link>
        <Link href="/teams" className={classes.link} onClick={toggleDrawer}>
          Teams
        </Link>
      </Menu>

      <Divider
        my="sm"
        color={theme.colorScheme === "dark" ? "dark.5" : "gray.1"}
      />
      <Group position="center" grow pb="xl" px="md">
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
