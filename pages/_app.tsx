import { RouterTransition } from "@/components/RouterTransition";
import useOnlineStatus from "@/hooks/useOnlineStatus";
import "@/styles/globals.css";
import { MantineProvider } from "@mantine/core";
import { Notifications, notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import { IconX } from "@tabler/icons-react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import { Roboto } from "next/font/google";
import { useEffect } from "react";
import { NextPageWithLayout } from "./page";

interface AppPropsWithLayout extends AppProps {
  Component: NextPageWithLayout;
}

const roboto = Roboto({
  subsets: ["latin-ext"],
  weight: ["100", "300", "400", "500", "700", "900"],
});

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

  return (
    <>
      <MantineProvider withGlobalClasses defaultColorScheme="light">
        <SessionProvider session={session}>
          <RouterTransition />
          {getLayout(
            <main className={roboto.className}>
              <Component {...pageProps} />
            </main>
          )}
          <Analytics />
          <SpeedInsights />
          <Notifications position="top-right" />
        </SessionProvider>
      </MantineProvider>
    </>
  );
}
