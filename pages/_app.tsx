import { RouterTransition } from "@/components/RouterTransition";
import useOnlineStatus from "@/hooks/useOnlineStatus";
import "@/styles/globals.css";
import {
  ColorScheme,
  ColorSchemeProvider,
  MantineProvider,
} from "@mantine/core";
import { useHotkeys, useLocalStorage } from "@mantine/hooks";
import { Notifications, notifications } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";
import { Analytics } from "@vercel/analytics/react";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { NextPageWithLayout } from "./page";

interface AppPropsWithLayout extends AppProps {
  Component: NextPageWithLayout;
}

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithLayout & { session: Session }) {
  const isOnline = useOnlineStatus();
  useEffect(() => {
    if (!isOnline) {
      notifications.show({
        id: "offline-warning-notification",
        title: "You're offline...",
        message:
          "Your internet connection has been disconnected. Please re-connect to ensure your changes are saved.",
        withCloseButton: false,
        color: "red",
        icon: <IconX />,
        autoClose: false,
      });
    } else {
      notifications.hide("offline-warning-notification");
    }
  }, [isOnline]);

  // Use the layout defined at the page level if available
  const getLayout = Component.getLayout || ((page) => page);

  // Color scheme - light or dark
  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: "mantine-color-scheme",
    defaultValue: "light",
    getInitialValueInEffect: true,
  });
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));
  useHotkeys([["mod+J", () => toggleColorScheme()]]);

  return (
    <>
      <ColorSchemeProvider
        colorScheme={colorScheme}
        toggleColorScheme={toggleColorScheme}
      >
        <MantineProvider
          withGlobalStyles
          withNormalizeCSS
          theme={{
            colorScheme,
            colors: {
              brand: [
                "#e0f1ff",
                "#b2d3ff",
                "#83b6fc",
                "#5398f7",
                "#257bf4",
                "#0b62da",
                "#034cab",
                "#00367b",
                "#00214d",
                "#000c1f",
              ],
            },
            primaryColor: "brand",
            primaryShade: 5,
          }}
        >
          <SessionProvider session={session}>
            <RouterTransition />
            {getLayout(<Component {...pageProps} />)}
            <Analytics />
            <Notifications position="top-right" />
          </SessionProvider>
        </MantineProvider>
      </ColorSchemeProvider>
    </>
  );
}
