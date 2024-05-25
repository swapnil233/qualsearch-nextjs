import {
  Group,
  Navbar,
  ScrollArea,
  Switch,
  createStyles,
  rem,
  useMantineColorScheme,
} from "@mantine/core";
import {
  IconAdjustments,
  IconFolder,
  IconHome,
  IconMoonStars,
  IconSun,
  IconUsers,
} from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { FC } from "react";
import { UserButton } from "../../buttons/UserButton";
import { navbarStyles } from "../navbar/Navbar.styles";
import { LinksGroup, LinksGroupProps } from "./NavbarLinksGroup";

const useStyles = createStyles((theme) => ({
  navbar: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[6]
        : "rgb(249, 249, 248)",
    paddingBottom: 0,
  },

  header: {
    padding: theme.spacing.md,
    paddingTop: 0,
    marginLeft: `calc(${theme.spacing.md} * -1)`,
    marginRight: `calc(${theme.spacing.md} * -1)`,
    color: theme.colorScheme === "dark" ? theme.white : theme.black,
    borderBottom: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[3]
    }`,
  },

  links: {
    marginLeft: `calc(${theme.spacing.md} * -1)`,
    marginRight: `calc(${theme.spacing.md} * -1)`,
  },

  linksInner: {
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },

  footer: {
    marginLeft: `calc(${theme.spacing.md} * -1)`,
    marginRight: `calc(${theme.spacing.md} * -1)`,
    borderTop: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[3]
    }`,
  },
}));

interface ISidebarProps {
  opened: boolean;
}

export const Sidebar: FC<ISidebarProps> = ({ opened }) => {
  const { classes } = useStyles();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const { theme } = navbarStyles();

  const { data } = useSession();
  const user = data?.user;

  const { asPath } = useRouter();

  const linksData: LinksGroupProps[] = [
    {
      label: "Dashboard",
      icon: IconHome,
      link: "/welcome",
    },
    {
      label: "Teams",
      icon: IconFolder,
      initiallyOpened: asPath.split("/").includes("teams"),
      links: [{ label: "Overview", link: "/teams" }],
    },
    {
      label: "People",
      icon: IconUsers,
      link: "/people",
    },
    {
      label: "Settings",
      icon: IconAdjustments,
      link: "/settings",
    },
  ];

  const links = linksData.map((item) => (
    <LinksGroup {...item} key={item.label} />
  ));

  return (
    <Navbar
      p="md"
      hiddenBreakpoint="sm"
      hidden={!opened}
      width={{ sm: 250, lg: 260 }}
      className={classes.navbar}
    >
      <Navbar.Section className={classes.header}>
        <Group position="apart">
          <Link href={"/"}>
            <Image
              src={
                theme.colorScheme === "dark"
                  ? "/logo-dark.svg"
                  : "/logo-light.svg"
              }
              height={30}
              width={109}
              alt="Logo"
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
      </Navbar.Section>

      <Navbar.Section grow className={classes.links} component={ScrollArea}>
        <div className={classes.linksInner}>{links}</div>
      </Navbar.Section>

      <Navbar.Section className={classes.footer}>
        <UserButton image={user?.image} name={user?.name} email={user?.email} />
      </Navbar.Section>
    </Navbar>
  );
};
