import React from "react";
import { Meta, Story } from "@storybook/react";

import Component, { Props } from ".";

export default {
  title: "molecules/Visualizer/Plugin",
  component: Component,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

export const Default: Story<Props> = args => (
  <div style={{ background: "#fff" }}>
    <Component {...args} />
  </div>
);

Default.args = {
  exposed: { hoge: 1 },
  plugin: "plugin",
  pluginBaseUrl: `${process.env.PUBLIC_URL}`,
  visible: true,
};
