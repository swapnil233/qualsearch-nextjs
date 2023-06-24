import { Meta, StoryFn } from "@storybook/react";
import ProjectCard, { IProjectCard } from "./ProjectCard";
import { mockProjectCardProps } from "./ProjectCard.mocks";

export default {
  title: "card/ProjectCard",
  component: ProjectCard,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {},
} as Meta<typeof ProjectCard>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: StoryFn<typeof ProjectCard> = (args) => (
  <ProjectCard {...args} />
);

export const Base = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args

Base.args = {
  ...mockProjectCardProps.base,
} as IProjectCard;
