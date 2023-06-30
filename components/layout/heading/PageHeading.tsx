import { Breadcrumbs, Button, Menu } from "@mantine/core";
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
  secondaryButtonMenuItems,
}) => {
  const breadcrumbItems =
    breadcrumbs?.map((item, index) => (
      <Link
        href={item.href}
        key={index}
        className="text-[#6B778C] hover:text-[#172B4D] hover:underline transition-colors no-underline"
      >
        {item.title}
      </Link>
    )) || [];

  return (
    <section className="w-full pb-8">
      <Breadcrumbs mb={"sm"}>{breadcrumbItems}</Breadcrumbs>
      <div className="flex justify-between flex-col md:flex-row">
        {description ? (
          <div className="flex flex-col mb-4 md:mb-0">
            <h1 className="text-3xl flex flex-col font-medium text-[#172B4D] mb-4">
              {title}
            </h1>
            <h2 className="text-base leading-6 text-gray-600">
              {description || ""}
            </h2>
          </div>
        ) : (
          <>
            <h1 className="text-3xl flex flex-col font-medium text-[#172B4D]">
              {title}
            </h1>
          </>
        )}
        <div className="flex">
          {primaryButtonText && primaryButtonAction && (
            <Button
              onClick={primaryButtonAction}
              sx={{
                backgroundColor: "#0052CC",
                ":hover": {
                  backgroundColor: "#013c94",
                },
              }}
            >
              {primaryButtonText}
            </Button>
          )}
          {secondaryButtonMenuItems && (
            <Menu shadow="md">
              <Menu.Target>
                <Button
                  variant="filled"
                  ml={primaryButtonText ? "xs" : 0}
                  sx={{
                    backgroundColor: "#F5F6F8",
                    ":hover": {
                      backgroundColor: "#F0F0F0",
                    },
                  }}
                >
                  <IconDots color="#42526E" />
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
      </div>
    </section>
  );
};

export default PageHeading;
