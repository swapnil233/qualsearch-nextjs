import { Meta, StoryFn } from "@storybook/react";
import TeamCard, { ITeamCard } from "./TeamCard";
import { mockTeamCardProps } from "./TeamCard.mocks";

export default {
  title: "card/TeamCard",
  component: TeamCard,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {},
} as Meta<typeof TeamCard>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: StoryFn<typeof TeamCard> = (args) => <TeamCard {...args} />;

export const Base = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args

Base.args = {
  ...mockTeamCardProps.base,
} as ITeamCard;
