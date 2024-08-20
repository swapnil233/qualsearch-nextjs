import Link from "next/link";
import { useRouter } from "next/router";
import { FC } from "react";
export interface SideNavLinkProps {
  icon: FC<any>;
  label: string;
  href: string;
}

const isActiveLink = (pathname: string, link: string) => {
  const last = pathname.split("/").length - 1;
  return pathname.split("/")[last] === link.split("/")[last];
};

export const SideNavLink: FC<SideNavLinkProps> = ({
  icon: Icon,
  label,
  href,
}) => {
  const { pathname } = useRouter();
  const isActive = isActiveLink(pathname, href);

  return (
    <Link className={isActive ? "active" : ""} href={href}>
      {label}
    </Link>
  );
};
