import { Meta, StoryFn } from "@storybook/react";
import PageHeading, { IPageHeading } from "./PageHeading";
import { mockPageHeadingProps } from "./PageHeading.mocks";

export default {
  title: "layout/PageHeading",
  component: PageHeading,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {},
} as Meta<typeof PageHeading>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: StoryFn<typeof PageHeading> = (args) => (
  <PageHeading {...args} />
);

export const Base = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args

Base.args = {
  ...mockPageHeadingProps.base,
} as IPageHeading;
