import { Sidebar } from "@/components/navigation/sidebar/Sidebar";
import {
  AppShell,
  Aside,
  Box,
  Burger,
  Center,
  Header,
  MediaQuery,
  SegmentedControl,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconNote, IconSparkles, IconTags } from "@tabler/icons-react";
import Head from "next/head";
import { FC, ReactNode, useState } from "react";

export interface ITranscriptPageLayout {
  children: ReactNode;
}

const TranscriptPageLayout: FC<ITranscriptPageLayout> = ({ children }) => {
  const [opened, setOpened] = useState<boolean>(false);
  const theme = useMantineTheme();
  const largeScreen = useMediaQuery("(min-width: 48em)");

  return (
    <>
      <Head>
        <title>Transcription</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <meta name="description" content="Transcribe videos" />
        <meta name="keywords" content="transcribe, diarize" />
        <meta name="author" content="Hasan Iqbal" />
      </Head>

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
        navbar={<Sidebar opened={opened} />}
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
        aside={
          <MediaQuery smallerThan="md" styles={{ display: "none" }}>
            <Aside
              p="sm"
              hiddenBreakpoint="sm"
              width={{ sm: 250, lg: 300 }}
              bg={
                theme.colorScheme === "dark"
                  ? theme.colors.dark[6]
                  : "rgb(249, 249, 248)"
              }
            >
              <SegmentedControl
                fullWidth
                color="indigo"
                data={[
                  {
                    value: "preview",
                    label: (
                      <Center>
                        <IconTags size="1rem" />
                        <Box ml={10}>Tags</Box>
                      </Center>
                    ),
                  },
                  {
                    value: "code",
                    label: (
                      <Center>
                        <IconNote size="1rem" />
                        <Box ml={10}>Notes</Box>
                      </Center>
                    ),
                  },
                  {
                    value: "export",
                    label: (
                      <Center>
                        <IconSparkles size="1rem" />
                        <Box ml={10}>Chat</Box>
                      </Center>
                    ),
                  },
                ]}
              />
            </Aside>
          </MediaQuery>
        }
      >
        <main>{children}</main>
      </AppShell>
    </>
  );
};

export default TranscriptPageLayout;
