import React from "react";
import { Meta, Story } from "@storybook/react";

import Component, { Props } from ".";

export default {
  title: "atoms/Plugin",
  component: Component,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

export const Default: Story<Props> = args => <Component {...args} />;

Default.args = {
  src: `${process.env.PUBLIC_URL}/plugin.js`,
  canBeVisible: true,
  onMessageCode: `globalThis.reearth.ui.onmessage`,
  style: {
    width: "300px",
    height: "300px",
    backgroundColor: "#fff",
  },
  exposed: {
    "console.log": console.log,
  },
  staticExposed: ({ render, postMessage }) => ({
    reearth: {
      ui: {
        show: render,
        postMessage,
      },
    },
  }),
};
