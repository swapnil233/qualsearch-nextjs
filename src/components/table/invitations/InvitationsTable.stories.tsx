import { Meta, StoryFn } from "@storybook/react";
import InvitationsTable, { IInvitationsTable } from "./InvitationsTable";
import { mockInvitationsTableProps } from "./InvitationsTable.mocks";

export default {
  title: "tables/InvitationsTable",
  component: InvitationsTable,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {},
} as Meta<typeof InvitationsTable>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: StoryFn<typeof InvitationsTable> = (args) => (
  <InvitationsTable {...args} />
);

export const Base = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args

Base.args = {
  ...mockInvitationsTableProps.base,
} as IInvitationsTable;
