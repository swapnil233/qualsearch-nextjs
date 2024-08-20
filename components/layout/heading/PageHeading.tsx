import {
  Box,
  Breadcrumbs,
  Button,
  Menu,
  Stack,
  Text,
  Title,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { IconDots } from "@tabler/icons-react";
import Link from "next/link";
import { FC, ReactNode } from "react";

interface IBreadcrumb {
  title: string;
  href: string;
}
export interface IPageHeading {
  title: string;
  description?: string;
  breadcrumbs?: IBreadcrumb[];
  primaryButtonText?: string;
  primaryButtonAction?: () => void;
  primaryButtonIcon?: ReactNode;
  secondaryButtonMenuItems?: Array<{
    title: string;
    action: () => void;
    icon?: ReactNode;
  }>;
}

const PageHeading: FC<IPageHeading> = ({
  title,
  description,
  breadcrumbs,
  primaryButtonText,
  primaryButtonAction,
  primaryButtonIcon,
  secondaryButtonMenuItems,
}) => {
  const { colorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();
  const breadcrumbItems =
    breadcrumbs?.map((item, index) => (
      <Link
        key={index}
        href={item.href}
        passHref
        style={{
          textDecoration: "none",
        }}
      >
        <Text color={colorScheme === "dark" ? "#8C9BAB" : "#626F86"}>
          {item.title}
        </Text>
      </Link>
    )) || [];

  return (
    <section className="w-full pb-8">
      <Breadcrumbs mb={"sm"}>{breadcrumbItems}</Breadcrumbs>
      <Box className="flex justify-between flex-col md:flex-row">
        {description ? (
          <>
            <Stack gap={0} mb={"1rem"} className="md:mb-0">
              <Title order={1} size={"1.875rem"} fw={500} mb={"1rem"}>
                {title}
              </Title>
              <Title order={2} size={"1rem"} lh={"1.5rem"} fw={"normal"}>
                {description || ""}
              </Title>
            </Stack>
          </>
        ) : (
          <>
            <Title order={1} size={"1.875rem"} fw={500} mb={"1rem"}>
              {title}
            </Title>
          </>
        )}
        <div className="flex">
          {primaryButtonText && primaryButtonAction && (
            <Button
              onClick={primaryButtonAction}
              leftSection={primaryButtonIcon}
            >
              {primaryButtonText}
            </Button>
          )}
          {secondaryButtonMenuItems && (
            <Menu shadow="md">
              <Menu.Target>
                <Button
                  variant="filled"
                  color={colorScheme === "dark" ? "gray.9" : "gray.4"}
                  ml={primaryButtonText ? "xs" : 0}
                >
                  <IconDots
                    color={
                      colorScheme === "dark"
                        ? theme.colors.gray[3]
                        : theme.colors.gray[7]
                    }
                  />
                </Button>
              </Menu.Target>

              <Menu.Dropdown>
                {secondaryButtonMenuItems.map((item, index) => (
                  <Menu.Item
                    key={index}
                    leftSection={item.icon}
                    onClick={item.action}
                  >
                    {item.title}
                  </Menu.Item>
                ))}
              </Menu.Dropdown>
            </Menu>
          )}
        </div>
      </Box>
    </section>
  );
};

export default PageHeading;
