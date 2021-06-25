import React from "react";
import { Meta, Story } from "@storybook/react";

import Component, { Props } from ".";

export default {
  title: "molecules/Visualizer/InfoBox/Block",
  component: Component,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

export const Default: Story<Props> = args => <Component {...args} />;
Default.args = {
  block: {
    plugin: "reearth/textblock",
    property: { default: { text: "hogehoge" } },
  },
  isSelected: false,
  isBuilt: false,
  isEditable: false,
};

export const Plugin: Story<Props> = args => (
  <div style={{ background: "#fff" }}>
    <Component {...args} />
  </div>
);
Plugin.args = {
  block: {
    plugin: "block",
    property: {
      location: { lat: 100, lng: 100 },
    },
  },
  isSelected: false,
  isBuilt: false,
  isEditable: false,
  pluginBaseUrl: process.env.PUBLIC_URL,
};
