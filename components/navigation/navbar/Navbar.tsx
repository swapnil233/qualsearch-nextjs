import {
  Avatar,
  Box,
  Burger,
  Button,
  Divider,
  Drawer,
  Group,
  Header,
  Loader,
  Menu,
  ScrollArea,
  Text,
  UnstyledButton,
  rem,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconChevronDown,
  IconLogout,
  IconSettings,
  IconUser,
} from "@tabler/icons-react";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { FC, useState } from "react";
import { navbarStyles } from "./Navbar.styles";

export interface INavbar {}

const Navbar: FC<INavbar> = () => {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false);
  const { classes, theme, cx } = navbarStyles();
  const [userMenuOpened, setUserMenuOpened] = useState(false);

  const { data, status } = useSession();
  const user = data?.user;

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
                  `${user?.name}'s profile picture` || "Default profile picture"
                }
                radius="xl"
                size={32}
              />

              <Text weight={500} size="sm" sx={{ lineHeight: 1 }} mr={3}>
                {user?.name}
              </Text>
              <IconChevronDown size={rem(12)} stroke={1.5} />
            </Group>
          </UnstyledButton>
        </Menu.Target>
        <Menu.Dropdown>
          <Link href="/profile/" className="no-underline">
            <Menu.Item icon={<IconUser size="0.9rem" stroke={1.5} />}>
              My profile
            </Menu.Item>
          </Link>
          <Link href="/profile/settings" className="no-underline">
            <Menu.Item icon={<IconSettings size="0.9rem" stroke={1.5} />}>
              Account settings
            </Menu.Item>
          </Link>
          <Menu.Divider />
          <Menu.Item
            onClick={() => {
              signOut({ callbackUrl: "/" });
            }}
            icon={<IconLogout size="0.9rem" stroke={1.5} />}
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
      <Button
        variant="light"
        onClick={() => signIn(undefined, { callbackUrl: "/" })}
      >
        Log in
      </Button>
    );
  }

  return (
    <Box>
      <Header height={60}>
        <Group
          className="max-w-6xl w-full mx-auto sm:px-4 px-6"
          position="apart"
          sx={{ height: "100%" }}
        >
          <Link href={"/"}>
            <Image
              src={"/TranscribeLogo.svg"}
              height={35}
              width={150}
              alt="Logo"
            />
          </Link>

          <Group
            sx={{ height: "100%" }}
            spacing={0}
            className={classes.hiddenMobile}
          >
            <Link href="/" className={classes.link}>
              Home
            </Link>
            <a href="/about" className={classes.link}>
              About
            </a>
          </Group>

          <Group className={classes.hiddenMobile}>{userMenu}</Group>

          <Burger
            opened={drawerOpened}
            onClick={toggleDrawer}
            className={classes.hiddenDesktop}
          />
        </Group>
      </Header>

      {/* Mobile menu */}
      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="100%"
        padding="md"
        title="Navigation"
        className={classes.hiddenDesktop}
        zIndex={1000000}
      >
        <ScrollArea h={`calc(100vh - ${rem(60)})`} mx="-md">
          {/* Profile links */}
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
                    alt={
                      `${user?.name}'s profile picture` ||
                      "Default profile picture"
                    }
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
                {/* Mobile - Profile */}
                <Link
                  href="/profile/"
                  onClick={toggleDrawer}
                  className="no-underline"
                >
                  <Menu.Item
                    className={classes.link}
                    icon={<IconUser size="0.9rem" stroke={1.5} />}
                    sx={{
                      backgroundColor: "white",
                    }}
                  >
                    My profile
                  </Menu.Item>

                  {/* Mobile - Profile */}
                  <Link
                    href="/profile/"
                    onClick={toggleDrawer}
                    className="no-underline"
                  >
                    <Menu.Item
                      className={classes.link}
                      icon={<IconSettings size="0.9rem" stroke={1.5} />}
                      sx={{
                        backgroundColor: "white",
                      }}
                    >
                      Account settings
                    </Menu.Item>
                  </Link>
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
            <Link href="/about" className={classes.link} onClick={toggleDrawer}>
              About
            </Link>
          </Menu>

          <Divider
            my="sm"
            color={theme.colorScheme === "dark" ? "dark.5" : "gray.1"}
          />
          <Group position="center" grow pb="xl" px="md">
            {status === "authenticated" ? (
              <>
                <Button
                  variant="light"
                  color="red"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="filled"
                  onClick={() => signIn(undefined, { callbackUrl: "/" })}
                >
                  Log in
                </Button>
              </>
            )}
          </Group>
        </ScrollArea>
      </Drawer>
    </Box>
  );
};

export default Navbar;
