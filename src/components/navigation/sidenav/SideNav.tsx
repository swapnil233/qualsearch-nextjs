import {
  generalLinks,
  projectLinks,
  teamLinks,
} from "@/lib/constants/sideNavLinks";
import { Box, ScrollArea, useMantineTheme } from "@mantine/core";
import { useRouter } from "next/router";
import { FC, useMemo } from "react";
import { SideNavHeader } from "./SideNavHeader";
import { SideNavLink, SideNavLinkProps } from "./SideNavLink";

interface ISideNavProps {
  opened: boolean;
}

export const SideNav: FC<ISideNavProps> = ({ opened }) => {
  const { pathname, query } = useRouter();
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
    <>
      <Box hidden={!opened}>
        <SideNavHeader />
        <ScrollArea style={{ height: "calc(100vh - 70px)" }}>
          <Box py={theme.spacing.md}>
            {linksData.map((item) => (
              <Box key={item.label} m="xs">
                <SideNavLink {...item} />
              </Box>
            ))}
          </Box>
        </ScrollArea>
      </Box>
    </>
  );
};
