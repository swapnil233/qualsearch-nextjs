import { TeamDropdown } from "@/components/shared/TeamDropdown";
import {
  Group,
  Navbar,
  Switch,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { IconMoonStars, IconSun } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";

export const SideNavHeader = () => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();

  return (
    <Navbar.Section
      style={{
        borderBottom: `${theme.spacing.xs}px solid ${
          colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[3]
        }`,
      }}
      color={colorScheme === "dark" ? theme.white : theme.black}
      px={theme.spacing.md}
      py={0}
      mx={`calc(${theme.spacing.md} * -1)`}
    >
      <Group justify="space-between">
        <Link href="/">
          <Image
            src={colorScheme === "dark" ? "/logo-dark.svg" : "/logo-light.svg"}
            height={30}
            width={109}
            alt="Logo"
          />
        </Link>
        <Switch
          checked={colorScheme === "dark"}
          onChange={() => toggleColorScheme()}
          size="md"
          onLabel={<IconSun size="1.25rem" stroke={1.5} />}
          offLabel={<IconMoonStars size="1.25rem" stroke={1.5} />}
        />
      </Group>
      <Group mt="md" grow>
        <TeamDropdown />
      </Group>
    </Navbar.Section>
  );
};
