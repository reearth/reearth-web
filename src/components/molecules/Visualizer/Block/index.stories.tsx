import { Meta, Story } from "@storybook/react";

import Component, { Props } from ".";

export default {
  title: "molecules/Visualizer/Block",
  component: Component,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

export const Default: Story<Props> = args => <Component {...args} />;
Default.args = {
  block: {
    id: "",
    pluginId: "reearth",
    extensionId: "textblock",
    property: { default: { text: "hogehoge" } },
  },
  isSelected: false,
  isBuilt: false,
  isEditable: false,
};
