import NavButton from "@/components/buttons/NavButton";
import NotificationsButton from "@/components/buttons/NotificationsButton";
import UserNavMenu from "@/components/menu/UserNavMenu";
import {
  AppShell,
  Burger,
  Group,
  ScrollArea,
  Stack,
  Switch,
  TextInput,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconChartBar,
  IconFiles,
  IconHome,
  IconInbox,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconMoonStars,
  IconNote,
  IconSearch,
  IconSun,
  IconTag,
  IconUser,
} from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { FC, ReactNode, useState } from "react";

export interface IDashboardLayout {
  children: ReactNode;
  aside?: ReactNode;
}

const DashboardLayout: FC<IDashboardLayout> = ({ children, aside }) => {
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] =
    useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const [newNotifications] = useState(false);
  const session = useSession();
  const [showProBanner, setShowProBanner] = useState<boolean | null>(true);
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();

  const router = useRouter();

  const handleCollapseClick = () => {
    toggleDesktop();
    closeMobile();

    if (showProBanner) {
      setShowProBanner(false);
    }
  };

  const renderNavButtons = () => {
    if (router.pathname.startsWith("/teams/[teamId]/projects/[projectId]/")) {
      const { teamId, projectId } = router.query;
      return (
        <Stack h="100%">
          <NavButton
            href={`/teams/${teamId}/projects/${projectId}/dashboard`}
            icon={<IconHome size={20} />}
            label="Dashboard"
            isCollapsed={!desktopOpened}
            closeMobileNav={closeMobile}
          />
          <NavButton
            href={`/teams/${teamId}/projects/${projectId}/files`}
            icon={<IconFiles size={20} />}
            label="Files"
            isCollapsed={!desktopOpened}
            closeMobileNav={closeMobile}
          />
          <NavButton
            href={`/teams/${teamId}/projects/${projectId}/notes`}
            icon={<IconNote size={20} />}
            label="Notes"
            isCollapsed={!desktopOpened}
            closeMobileNav={closeMobile}
          />
          <NavButton
            href={`/teams/${teamId}/projects/${projectId}/tags`}
            icon={<IconTag size={20} />}
            label="Tags"
            isCollapsed={!desktopOpened}
            closeMobileNav={closeMobile}
          />
        </Stack>
      );
    } else if (router.pathname.startsWith("/teams")) {
      return (
        <Stack h="100%">
          <NavButton
            href="/teams"
            icon={<IconChartBar size={20} />}
            label="Teams"
            isCollapsed={!desktopOpened}
            closeMobileNav={closeMobile}
          />
          <NavButton
            href="/profile"
            icon={<IconUser size={20} />}
            label="Profile"
            isCollapsed={!desktopOpened}
            closeMobileNav={closeMobile}
          />
        </Stack>
      );
    } else {
      return (
        <Stack h="100%">
          <NavButton
            href="/dashboard"
            icon={<IconHome size={20} />}
            label="Home"
            isCollapsed={!desktopOpened}
            closeMobileNav={closeMobile}
          />
          <NavButton
            href="/inbox"
            icon={<IconInbox size={20} />}
            label="Inbox"
            isCollapsed={!desktopOpened}
            closeMobileNav={closeMobile}
          />
          <NavButton
            href="/reports"
            icon={<IconChartBar size={20} />}
            label="Reports"
            isCollapsed={!desktopOpened}
            closeMobileNav={closeMobile}
          />
        </Stack>
      );
    }
  };

  return (
    <AppShell
      header={{ height: 70 }}
      navbar={{
        width: { base: 300, sm: desktopOpened ? 250 : 80 },
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened, desktop: false },
      }}
      {...(aside
        ? {
            aside: {
              width: 300,
              breakpoint: "md",
              collapsed: { desktop: false, mobile: true },
            },
          }
        : {})}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Burger
            opened={mobileOpened}
            onClick={toggleMobile}
            hiddenFrom="sm"
            size="sm"
          />
          <Group align="center" wrap="nowrap" gap="sm">
            <Link href="/">
              <Image
                src={
                  colorScheme === "dark" ? "/logo-dark.svg" : "/logo-light.svg"
                }
                alt="Logo"
                height={38}
                width={160}
              />
            </Link>
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
            />
          </Group>

          <Group gap="xs" justify="flex-end" w="100%">
            <TextInput
              leftSection={<IconSearch size="1.1rem" />}
              placeholder="Search and discover"
              miw={300}
              visibleFrom="sm"
            />
            <NotificationsButton newNotifications={newNotifications} />
            <UserNavMenu
              name={session.data?.user.name || "Loading..."}
              email={session.data?.user.email || "Loading..."}
              image={session.data?.user.image || ""}
            />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar
        w={{ base: 300, sm: desktopOpened ? 250 : 80 }}
        style={{ zIndex: 200 }}
      >
        <AppShell.Section
          bg={colorScheme === "dark" ? "#25262b" : "#f9f9f8"}
          px="md"
          pt="md"
          pb={0}
          grow
          component={ScrollArea}
        >
          {renderNavButtons()}
        </AppShell.Section>
        <AppShell.Section px="md" py={"xs"} visibleFrom="sm">
          <Stack>
            <NavButton
              href="#"
              icon={
                desktopOpened ? (
                  <IconLayoutSidebarLeftCollapse size={20} />
                ) : (
                  <IconLayoutSidebarLeftExpand size={20} />
                )
              }
              label="Collapse"
              isCollapsed={!desktopOpened}
              closeMobileNav={handleCollapseClick}
            />
          </Stack>
        </AppShell.Section>
      </AppShell.Navbar>
      {aside && <AppShell.Aside p="md">{aside}</AppShell.Aside>}
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
};

export default DashboardLayout;
