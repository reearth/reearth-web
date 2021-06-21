import React from "react";
import { Meta, Story } from "@storybook/react";

import Component, { Props } from ".";
import { commonApi } from "../../storybook";

export default {
  title: "molecules/Visualizer/Widget/Storytelling",
  component: Component,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

export const Default: Story<Props> = args => <Component {...args} api={commonApi} />;
Default.args = {
  widget: {
    property: {
      stories: [
        { layer: "a", title: "a" },
        { layer: "b", title: "b" },
        { layer: "c", title: "c" },
      ],
    },
  },
  isBuilt: false,
  isEditable: false,
};

export const AutoStart: Story<Props> = args => <Component {...args} api={commonApi} />;

AutoStart.args = {
  widget: {
    property: {
      stories: [
        { layer: "a", title: "a" },
        { layer: "b", title: "b" },
        { layer: "c", title: "c" },
      ],
      default: { autoStart: true },
    },
  },
  isBuilt: false,
  isEditable: false,
};
