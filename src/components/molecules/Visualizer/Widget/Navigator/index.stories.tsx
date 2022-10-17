import { Meta, Story } from "@storybook/react";

import Component, { Props } from ".";

export default {
  title: "molecules/Visualizer/Widget/Navigator",
  component: Component,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

const Template: Story<Props> = args => <Component {...args} />;

export const Default = Template.bind({});
