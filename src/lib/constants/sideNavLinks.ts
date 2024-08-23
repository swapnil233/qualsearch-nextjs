import { SideNavLinkProps } from "@/components/navigation/sidenav/SideNavLink";
import {
  IconFiles,
  IconFolder,
  IconLayoutDashboard,
  IconNotes,
  IconPlus,
  IconSettings,
  IconTags,
  IconUser,
  IconUsers
} from "@tabler/icons-react";

export const generalLinks: SideNavLinkProps[] = [
  { label: "Teams", icon: IconFolder, href: "/teams" },
  { label: "Profile", icon: IconUser, href: "/profile" },
];

export const teamLinks = (teamId: string): SideNavLinkProps[] => [
  { label: "Teams", icon: IconFolder, href: "/teams" },
  {
    label: "Team settings",
    icon: IconSettings,
    href: `/teams/${teamId}/settings`,
  },
  { label: "People", icon: IconUsers, href: `/teams/${teamId}/people` },
  {
    label: "Add members",
    icon: IconPlus,
    href: `/teams/${teamId}/add-members`,
  },
];

export const projectLinks = (
  teamId: string,
  projectId: string
): SideNavLinkProps[] => [
    {
      label: "Dashboard",
      icon: IconLayoutDashboard,
      href: `/teams/${teamId}/projects/${projectId}/dashboard`,
    },
    {
      label: "Files",
      icon: IconFiles,
      href: `/teams/${teamId}/projects/${projectId}/files`,
    },
    {
      label: "Notes",
      icon: IconNotes,
      href: `/teams/${teamId}/projects/${projectId}/notes`,
    },
    {
      label: "Tags",
      icon: IconTags,
      href: `/teams/${teamId}/projects/${projectId}/tags`,
    },
  ];
