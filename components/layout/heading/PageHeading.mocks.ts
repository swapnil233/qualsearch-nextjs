import { IPageHeading } from "./PageHeading";

const base: IPageHeading = {
  title: "Heading Section",
  description: "This is a description",
  breadcrumbs: [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "Teams",
      href: "/team",
    },
    {
      title: "Projects",
      href: "/team/project",
    },
    {
      title: "Files",
      href: "/team/project/files",
    },
  ],
  primaryButtonAction: () => {
    console.log("Primary button clicked");
  },
  primaryButtonText: "Primary Button",
};

export const mockPageHeadingProps = {
  base,
};
