import { IEmptyState } from "./EmptyState";

const base: IEmptyState = {
  title: "Create a team",
  description: "Teams allow you to collaborate on projects.",
  imageUrl: "/public/empty-team.svg",
  primaryButtonText: "Create new team",
  primaryButtonAction: () => { console.log("clicked!") },
};

export const mockEmptyStateProps = {
  base,
};
