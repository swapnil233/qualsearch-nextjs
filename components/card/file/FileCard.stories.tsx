import { Meta, StoryFn } from "@storybook/react";
import FileCard, { IFileCard } from "./FileCard";
import { mockFileCardProps } from "./FileCard.mocks";

export default {
  title: "card/FileCard",
  component: FileCard,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {},
} as Meta<typeof FileCard>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: StoryFn<typeof FileCard> = (args) => <FileCard {...args} />;

export const Base = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args

Base.args = {
  ...mockFileCardProps.base,
} as IFileCard;
