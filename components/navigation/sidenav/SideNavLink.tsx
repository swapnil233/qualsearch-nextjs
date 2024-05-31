import { Box, Group, ThemeIcon, createStyles, rem } from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/router";
import { FC } from "react";

const useStyles = createStyles((theme) => ({
  control: {
    fontWeight: 500,
    display: "block",
    width: "100%",
    textDecoration: "none",
    padding: `${theme.spacing.xs} ${theme.spacing.md}`,
    color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,
    fontSize: theme.fontSizes.sm,
    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[7]
          : theme.colors.gray[2],
      color: theme.colorScheme === "dark" ? theme.white : theme.black,
    },
  },
  active: {
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : "#e0f1ff",
    color: theme.colorScheme === "dark" ? theme.white : theme.black,
  },
  link: {
    fontWeight: 500,
    display: "block",
    textDecoration: "none",
    padding: `${theme.spacing.xs} ${theme.spacing.md}`,
    paddingLeft: rem(31),
    marginLeft: rem(30),
    fontSize: theme.fontSizes.sm,
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[0]
        : theme.colors.gray[7],
    borderLeft: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[3]
    }`,
    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[7]
          : theme.colors.gray[0],
      color: theme.colorScheme === "dark" ? theme.white : theme.black,
    },
  },
  chevron: {
    transition: "transform 200ms ease",
  },
}));

export interface SideNavLinkProps {
  icon: FC<any>;
  label: string;
  href: string;
}

const isActiveLink = (pathname: string, link: string) => {
  const last = pathname.split("/").length - 1;
  return pathname.split("/")[last] === link.split("/")[last];
};

export const SideNavLink: FC<SideNavLinkProps> = ({
  icon: Icon,
  label,
  href,
}) => {
  const { classes, cx } = useStyles();
  const { pathname } = useRouter();
  const isActive = isActiveLink(pathname, href);

  return (
    <Link
      className={cx(classes.control, { [classes.active]: isActive })}
      href={href}
    >
      <Group spacing={0}>
        <ThemeIcon variant="light" size={30}>
          <Icon size="1.1rem" />
        </ThemeIcon>
        <Box ml="md">{label}</Box>
      </Group>
    </Link>
  );
};
