import { SideNav } from "@/components/navigation/sidenav/SideNav";
import {
  AppShell,
  Burger,
  Header,
  MediaQuery,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { FC, ReactNode, useState } from "react";

export interface IPrimaryLayout {
  children: ReactNode;
}

const PrimaryLayout: FC<IPrimaryLayout> = ({ children }) => {
  const [opened, setOpened] = useState<boolean>(false);
  const theme = useMantineTheme();
  const largeScreen = useMediaQuery("(min-width: 48em)");

  return (
    <>
      <AppShell
        padding="2rem"
        styles={{
          main: {
            background:
              theme.colorScheme === "dark" ? theme.colors.dark[8] : "white",
          },
        }}
        navbarOffsetBreakpoint="sm"
        asideOffsetBreakpoint="sm"
        navbar={<SideNav opened={opened} />}
        header={
          !largeScreen ? (
            <Header height={{ base: 50, md: 70 }} p="1rem 2rem">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                <Text
                  color={theme.colorScheme === "dark" ? "white" : "black"}
                ></Text>
                <MediaQuery largerThan="sm" styles={{ display: "none" }}>
                  <Burger
                    opened={opened}
                    onClick={() => setOpened((o) => !o)}
                    size="sm"
                    color={theme.colorScheme === "dark" ? "white" : "black"}
                    ml="auto"
                  />
                </MediaQuery>
              </div>
            </Header>
          ) : (
            <></>
          )
        }
      >
        <main>{children}</main>
      </AppShell>
    </>
  );
};

export default PrimaryLayout;
