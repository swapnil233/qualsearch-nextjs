import {
  Box,
  Burger,
  Drawer,
  Group,
  Header,
  Loader,
  ScrollArea,
  rem,
  useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { FC, useMemo } from "react";
import MobileMenu from "./MobileMenu";
import { navbarStyles } from "./Navbar.styles";
import UserMenu from "./UserMenu";

const Navbar: FC = () => {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false);
  const { classes, theme } = navbarStyles();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const { data, status } = useSession();
  const user = data?.user;

  const userMenu = useMemo(() => {
    if (status === "loading") {
      return <Loader size={"sm"} />;
    }
    return (
      <UserMenu
        user={user}
        status={status}
        colorScheme={colorScheme}
        toggleColorScheme={toggleColorScheme}
      />
    );
  }, [status, user, toggleColorScheme, colorScheme]);

  return (
    <Box>
      <Header height={70}>
        <Group
          className="max-w-7xl w-full mx-auto sm:px-4 px-6"
          position="apart"
          h={"100%"}
        >
          <Link href="/">
            <Image
              src={
                theme.colorScheme === "dark"
                  ? "/logo-dark.svg"
                  : "/logo-light.svg"
              }
              height={40}
              width={139}
              alt="Logo"
            />
          </Link>

          <Group className={classes.hiddenMobile}>{userMenu}</Group>

          <Burger
            opened={drawerOpened}
            onClick={toggleDrawer}
            className={classes.hiddenDesktop}
          />
        </Group>
      </Header>

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
          <MobileMenu
            user={user}
            status={status}
            toggleDrawer={toggleDrawer}
            signIn={signIn}
            signOut={signOut}
          />
        </ScrollArea>
      </Drawer>
    </Box>
  );
};

export default Navbar;
