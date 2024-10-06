import { Tooltip, useMantineColorScheme } from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/router";
import { FC, ReactNode } from "react";

interface NavButtonProps {
  href: string;
  as?: string;
  icon: ReactNode;
  label: string;
  isCollapsed: boolean;
  closeMobileSidebarNav: () => void;
  nested?: boolean;
  children?: ReactNode;
  dontPrefetch?: boolean;
}

const NavButton: FC<NavButtonProps> = ({
  href,
  as,
  icon,
  label,
  isCollapsed,
  closeMobileSidebarNav,
  nested = false,
  children,
  dontPrefetch,
}) => {
  const router = useRouter();
  const currentPath = router.pathname;
  const navPath = href;

  const isActive =
    currentPath === navPath || currentPath.startsWith(navPath + "/");

  const { colorScheme } = useMantineColorScheme();
  const isDarkMode = colorScheme === "dark";

  const handleClick = () => {
    closeMobileSidebarNav();
  };

  const linkContent = (
    <Link
      href={href}
      prefetch={false}
      as={as}
      {...(dontPrefetch === true && { prefetch: false })}
      onClick={handleClick}
      className={`flex ${
        isCollapsed ? "px-2" : nested ? "pl-6" : "px-[13px]"
      } py-3 text-sm rounded-md ${
        isActive
          ? isDarkMode
            ? "bg-[#1a1b1e]"
            : "bg-[#e0f1ff]"
          : isDarkMode
            ? "hover:bg-[#1a1b1e]"
            : "hover:bg-[#e9ecef]"
      } ${isCollapsed && "justify-center"}`}
    >
      <span className={isCollapsed ? "" : "mr-3"}>{icon}</span>
      {!isCollapsed && <span>{label}</span>}
    </Link>
  );

  return (
    <div>
      {isCollapsed ? (
        <Tooltip label={label}>{linkContent}</Tooltip>
      ) : (
        linkContent
      )}
      {children && !isCollapsed && (
        // Indentation for nested children
        <div className="pl-4 pt-2">{children}</div>
      )}
    </div>
  );
};

export default NavButton;
