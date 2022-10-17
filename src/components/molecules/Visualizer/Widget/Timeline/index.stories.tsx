import { Meta, Story } from "@storybook/react";

import Component, { Props } from ".";

export default {
  title: "molecules/Visualizer/Widget/Timeline",
  component: Component,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

const Template: Story<Props> = args => <Component {...args} />;

export const Default = Template.bind({});

Default.args = {
  widget: {
    id: "",
    extended: {
      horizontally: false,
      vertically: false,
    },
  },
};

export const Extended = Template.bind({});

Extended.args = {
  widget: {
    id: "",
    extended: {
      horizontally: true,
      vertically: false,
    },
  },
};
