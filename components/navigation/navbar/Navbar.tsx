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
  Switch,
  Text,
  rem,
  useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconMoonStars,
  IconSettings,
  IconSun,
  IconUser,
} from "@tabler/icons-react";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { FC, useMemo } from "react";
import { navbarStyles } from "./Navbar.styles";
import UserMenu from "./UserMenu";

export interface INavbar {}

const Navbar: FC<INavbar> = () => {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false);
  const { classes, theme } = navbarStyles();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const { data, status } = useSession();
  const user = data?.user;

  const userMenu = useMemo(() => {
    if (status === "loading") {
      return <Loader size={"sm"} />;
    } else {
      return (
        <UserMenu
          user={user}
          status={status}
          colorScheme={colorScheme}
          toggleColorScheme={toggleColorScheme}
        />
      );
    }
  }, [status, user, toggleColorScheme, colorScheme]);

  return (
    <Box>
      <Header height={60}>
        <Group
          className="max-w-6xl w-full mx-auto sm:px-4 px-6"
          position="apart"
          h={"100%"}
        >
          <Link href={"/"}>
            <Image
              src={"/TranscribeLogo.svg"}
              height={30}
              width={109}
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
            <Link href="/teams" className={classes.link}>
              Teams
            </Link>
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
          <Group px={"sm"} w={"100%"}>
            <Switch
              checked={colorScheme === "dark"}
              onChange={() => toggleColorScheme()}
              size="md"
              onLabel={
                <IconSun color={theme.white} size="1.25rem" stroke={1.5} />
              }
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
                  onClick={() => signIn(undefined, { callbackUrl: "/teams" })}
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
