import { Tooltip } from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/router";
import { FC, ReactNode } from "react";

interface NavButtonProps {
  href: string;
  icon: ReactNode;
  label: string;
  isCollapsed: boolean;
  closeMobileNav: () => void;
}

const NavButton: FC<NavButtonProps> = ({
  href,
  icon,
  label,
  isCollapsed,
  closeMobileNav,
}) => {
  const router = useRouter();
  const isActive = router.asPath === href;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    closeMobileNav();
    router.push(href);
  };

  const linkContent = (
    <Link
      href={href}
      onClick={handleClick}
      className={`flex ${
        isCollapsed ? "px-2" : "px-[13px]"
      } py-3 text-sm rounded-md ${
        isActive
          ? "bg-gray-200 text-gray-900 font-semibold"
          : "text-gray-600 hover:bg-gray-100"
      } ${isCollapsed && "justify-center"}`}
    >
      <span className={isCollapsed ? "" : "mr-3"}>{icon}</span>
      {!isCollapsed && <span>{label}</span>}
    </Link>
  );

  return isCollapsed ? (
    <Tooltip label={label}>{linkContent}</Tooltip>
  ) : (
    linkContent
  );
};

export default NavButton;
