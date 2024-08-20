import { SideNav } from "@/components/navigation/sidenav/SideNav";
import {
  AppShell,
  Burger,
  Text,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { FC, ReactNode } from "react";

export interface IPrimaryLayout {
  children: ReactNode;
}

const PrimaryLayout: FC<IPrimaryLayout> = ({ children }) => {
  const [opened, { toggle }] = useDisclosure(false);
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();

  return (
    <AppShell
      padding="md"
      header={{
        height: 70,
      }}
      navbar={{
        width: { base: 300, sm: 250 },
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      styles={{
        main: {
          background: colorScheme === "dark" ? theme.colors.dark[8] : "white",
        },
      }}
    >
      <AppShell.Header>
        <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Text c={colorScheme === "dark" ? "white" : "black"}>Header</Text>
          <Burger
            opened={opened}
            onClick={toggle}
            hiddenFrom="sm"
            size="sm"
            color={colorScheme === "dark" ? "white" : "black"}
            ml="auto"
          />
        </div>
      </AppShell.Header>

      <AppShell.Navbar>
        <SideNav opened={opened} />
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
};

export default PrimaryLayout;
