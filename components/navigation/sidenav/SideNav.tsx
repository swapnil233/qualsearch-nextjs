import {
  generalLinks,
  projectLinks,
  teamLinks,
} from "@/lib/constants/sideNavLinks";
import {
  Box,
  ScrollArea,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { useRouter } from "next/router";
import { FC, useMemo } from "react";
import { SideNavHeader } from "./SideNavHeader";
import { SideNavLink, SideNavLinkProps } from "./SideNavLink";

interface ISideNavProps {
  opened: boolean;
}

export const SideNav: FC<ISideNavProps> = ({ opened }) => {
  const { pathname, query } = useRouter();
  const { colorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();

  const linksData: SideNavLinkProps[] = useMemo(() => {
    const { teamId, projectId } = query as {
      teamId: string;
      projectId: string;
    };

    if (pathname.includes("/projects/")) {
      return projectLinks(teamId, projectId);
    } else if (pathname.includes(`/teams/${teamId}`)) {
      return teamLinks(teamId);
    } else {
      return generalLinks;
    }
  }, [pathname, query]);

  return (
    <Navbar
      p="md"
      hiddenBreakpoint="sm"
      hidden={!opened}
      width={{ sm: 250, lg: 220 }}
      bg={colorScheme === "dark" ? theme.colors.dark[6] : "rgb(249, 249, 248)"}
      pb={0}
    >
      <SideNavHeader />
      <Navbar.Section
        mx={`calc(${theme.spacing.md} * -1)`}
        grow
        component={ScrollArea}
      >
        <Box py={theme.spacing.md}>
          {linksData.map((item) => (
            <Box key={item.label} m="xs">
              <SideNavLink {...item} />
            </Box>
          ))}
        </Box>
      </Navbar.Section>
    </Navbar>
  );
};
