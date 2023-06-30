import { Meta, StoryFn } from "@storybook/react";
import EmptyState, { IEmptyState } from "./EmptyState";
import { mockEmptyStateProps } from "./EmptyState.mocks";

export default {
  title: "templates/EmptyState",
  component: EmptyState,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {},
} as Meta<typeof EmptyState>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: StoryFn<typeof EmptyState> = (args) => <EmptyState {...args} />;

export const Base = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args

Base.args = {
  ...mockEmptyStateProps.base,
} as IEmptyState;
