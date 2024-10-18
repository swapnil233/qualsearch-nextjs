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
  IconFiles,
  IconFolder,
  IconFolders,
  IconHome,
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
import { FC, ReactNode, useEffect, useState } from "react";
import { TeamDropdown } from "../TeamDropdown";

export interface IDashboardLayout {
  children: ReactNode;
  aside?: ReactNode;
}

const DashboardLayout: FC<IDashboardLayout> = ({ children, aside }) => {
  const [
    mobileSidebarWasExpanded,
    { toggle: expandMobileSidebar, close: closeMobileSidebar },
  ] = useDisclosure();
  const [sidebarWasExpanded, { toggle: expandSidebar }] = useDisclosure(true);
  const [newNotifications] = useState(false);
  const session = useSession();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();

  const router = useRouter();

  const handleCollapseClick = () => {
    expandSidebar();
    closeMobileSidebar();
  };

  const renderNavButtons = () => {
    const { pathname, query } = router;
    const { teamId, projectId } = query;

    if (pathname.startsWith("/teams/[teamId]/projects/[projectId]")) {
      // On a project page or any of its subpages (files, notes, tags, etc.)
      return (
        <Stack h="100%">
          <NavButton
            href="/teams/[teamId]/projects/[projectId]/dashboard"
            as={`/teams/${teamId}/projects/${projectId}/dashboard`}
            icon={<IconHome size={20} />}
            label="Dashboard"
            isCollapsed={!sidebarWasExpanded}
            closeMobileSidebarNav={closeMobileSidebar}
            dontPrefetch={true}
          />
          <NavButton
            href="/teams/[teamId]/projects/[projectId]/files"
            as={`/teams/${teamId}/projects/${projectId}/files`}
            icon={<IconFiles size={20} />}
            label="Files"
            isCollapsed={!sidebarWasExpanded}
            closeMobileSidebarNav={closeMobileSidebar}
            dontPrefetch={true}
          />
          <NavButton
            href="/teams/[teamId]/projects/[projectId]/notes"
            as={`/teams/${teamId}/projects/${projectId}/notes`}
            icon={<IconNote size={20} />}
            label="Notes"
            isCollapsed={!sidebarWasExpanded}
            closeMobileSidebarNav={closeMobileSidebar}
            dontPrefetch={true}
          />
          <NavButton
            href="/teams/[teamId]/projects/[projectId]/tags"
            as={`/teams/${teamId}/projects/${projectId}/tags`}
            icon={<IconTag size={20} />}
            label="Tags"
            isCollapsed={!sidebarWasExpanded}
            closeMobileSidebarNav={closeMobileSidebar}
            dontPrefetch={true}
          />
        </Stack>
      );
    } else if (pathname.startsWith("/teams/[teamId]/projects")) {
      // On a team's projects list page
      return (
        <Stack h="100%">
          <NavButton
            href="/teams"
            icon={<IconFolder size={20} />}
            label="Teams"
            isCollapsed={!sidebarWasExpanded}
            closeMobileSidebarNav={closeMobileSidebar}
          >
            <NavButton
              href="/teams/[teamId]/projects"
              as={`/teams/${teamId}/projects`}
              icon={<IconFolders size={20} />}
              label="Projects"
              isCollapsed={!sidebarWasExpanded}
              closeMobileSidebarNav={closeMobileSidebar}
              nested // Pass nested to indent
            />
          </NavButton>
          <NavButton
            href="/account"
            icon={<IconUser size={20} />}
            label="Account"
            isCollapsed={!sidebarWasExpanded}
            closeMobileSidebarNav={closeMobileSidebar}
          />
        </Stack>
      );
    } else if (pathname.startsWith("/teams")) {
      // On the teams page
      return (
        <Stack h="100%">
          <NavButton
            href="/teams"
            icon={<IconFolder size={20} />}
            label="Teams"
            isCollapsed={!sidebarWasExpanded}
            closeMobileSidebarNav={closeMobileSidebar}
          />
          <NavButton
            href="/account"
            icon={<IconUser size={20} />}
            label="Account"
            isCollapsed={!sidebarWasExpanded}
            closeMobileSidebarNav={closeMobileSidebar}
          />
        </Stack>
      );
    } else {
      // Default navigation for any other pages
      return (
        <Stack h="100%">
          <NavButton
            href="/teams"
            icon={<IconFolder size={20} />}
            label="Teams"
            isCollapsed={!sidebarWasExpanded}
            closeMobileSidebarNav={closeMobileSidebar}
          />
          <NavButton
            href="/account"
            icon={<IconUser size={20} />}
            label="Account"
            isCollapsed={!sidebarWasExpanded}
            closeMobileSidebarNav={closeMobileSidebar}
          />
        </Stack>
      );
    }
  };

  useEffect(() => {
    if (mobileSidebarWasExpanded) {
      console.log("Mobile sidebar was expanded", mobileSidebarWasExpanded);
    }

    if (sidebarWasExpanded) {
      console.log("Sidebar expanded", sidebarWasExpanded);
    }

    if (!mobileSidebarWasExpanded) {
      console.log("Mobile sidebar was collapsed", mobileSidebarWasExpanded);
    }
  }, [mobileSidebarWasExpanded, sidebarWasExpanded]);

  return (
    <AppShell
      header={{ height: 70 }}
      navbar={{
        width: { base: 300, sm: sidebarWasExpanded ? 250 : 80 },
        breakpoint: "sm",
        collapsed: { mobile: !mobileSidebarWasExpanded, desktop: false },
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
            opened={mobileSidebarWasExpanded}
            onClick={expandMobileSidebar}
            hiddenFrom="sm"
            size="sm"
          />
          <Group align="center" wrap="nowrap" gap="sm">
            {!mobileSidebarWasExpanded && (
              <Link href="/">
                <Image
                  src={
                    colorScheme === "dark"
                      ? "/logo-dark.svg"
                      : "/logo-light.svg"
                  }
                  alt="Logo"
                  height={38}
                  width={160}
                />
              </Link>
            )}
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
        w={{ base: 300, sm: sidebarWasExpanded ? 250 : 80 }}
        style={{ zIndex: 200 }}
      >
        <AppShell.Section
          // bg={colorScheme === "dark" ? "#25262b" : "#f9f9f8"}
          px="md"
          pt="md"
          pb={0}
          grow
          component={ScrollArea}
        >
          <Stack>
            {sidebarWasExpanded && <TeamDropdown />}
            {renderNavButtons()}
          </Stack>
        </AppShell.Section>
        <AppShell.Section
          px="md"
          py={"xs"}
          visibleFrom="sm"
          // bg={colorScheme === "dark" ? "#25262b" : "#f9f9f8"}
        >
          <Stack>
            <NavButton
              href="#"
              icon={
                sidebarWasExpanded ? (
                  <IconLayoutSidebarLeftCollapse size={20} />
                ) : (
                  <IconLayoutSidebarLeftExpand size={20} />
                )
              }
              label="Collapse"
              isCollapsed={!sidebarWasExpanded}
              closeMobileSidebarNav={handleCollapseClick}
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
