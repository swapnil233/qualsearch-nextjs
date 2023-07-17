// components/RouterTransition.tsx
import { useMantineTheme } from "@mantine/core";
import { NavigationProgress, nprogress } from "@mantine/nprogress";
import { useRouter } from "next/router";
import { useEffect } from "react";

export function RouterTransition() {
  const router = useRouter();
  const theme = useMantineTheme();

  useEffect(() => {
    const handleStart = (url: string) =>
      url !== router.asPath && nprogress.start();
    const handleComplete = () => nprogress.complete();

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  }, [router.asPath]);

  return (
    <NavigationProgress
      color={theme.colorScheme === "dark" ? "green" : theme.primaryColor}
      autoReset={true}
      progressLabel="Loading Page"
      size={5}
    />
  );
}
