import { Meta, StoryFn } from "@storybook/react";
import TeamTable, { ITeamTable } from "./TeamTable";
import { mockTeamTableProps } from "./TeamTable.mocks";

export default {
  title: "tables/TeamTable",
  component: TeamTable,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {},
} as Meta<typeof TeamTable>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: StoryFn<typeof TeamTable> = (args) => <TeamTable {...args} />;

export const Base = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args

Base.args = {
  ...mockTeamTableProps.base,
} as ITeamTable;
