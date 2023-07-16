import {
  Anchor,
  Box,
  Breadcrumbs,
  Button,
  Menu,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { IconDots } from "@tabler/icons-react";
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
  const breadcrumbItems =
    breadcrumbs?.map((item, index) => (
      <Anchor key={index} href={item.href}>
        {item.title}
      </Anchor>
    )) || [];
  const theme = useMantineTheme();

  return (
    <section className="w-full pb-8">
      <Breadcrumbs mb={"sm"}>{breadcrumbItems}</Breadcrumbs>
      <Box className="flex justify-between flex-col md:flex-row">
        {description ? (
          <>
            <Stack spacing={0} mb={"1rem"} className="md:mb-0">
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
            <Text className="text-3xl mb-4 md:mb-0" fw={500}>
              {title}
            </Text>
          </>
        )}
        <div className="flex">
          {primaryButtonText && primaryButtonAction && (
            <Button onClick={primaryButtonAction} leftIcon={primaryButtonIcon}>
              {primaryButtonText}
            </Button>
          )}
          {secondaryButtonMenuItems && (
            <Menu shadow="md">
              <Menu.Target>
                <Button
                  variant="filled"
                  color={theme.colorScheme === "dark" ? "gray.9" : "gray.4"}
                  ml={primaryButtonText ? "xs" : 0}
                >
                  <IconDots
                    color={
                      theme.colorScheme === "dark"
                        ? theme.colors.gray[3]
                        : theme.colors.gray[7]
                    }
                  />
                </Button>
              </Menu.Target>

              <Menu.Dropdown>
                {secondaryButtonMenuItems.map((item, index) => (
                  <Menu.Item key={index} icon={item.icon} onClick={item.action}>
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
