import React from "react";
import { Meta, Story } from "@storybook/react";
import { action } from "@storybook/addon-actions";

import Component, { Props } from ".";

export default {
  title: "atoms/Plugin",
  component: Component,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

export const Default: Story<Props> = args => <Component {...args} />;

let cb: (message: any) => void | undefined;

Default.args = {
  src: `${process.env.PUBLIC_URL}/plugins/plugin.js`,
  canBeVisible: true,
  style: {
    width: "300px",
    height: "300px",
    backgroundColor: "#fff",
  },
  exposed: {
    "console.log": action("console.log"),
  },
  staticExposed: ({ render, postMessage }) => ({
    reearth: {
      ui: {
        show: render,
        postMessage,
        get onmessage() {
          return cb;
        },
        set onmessage(value: (message: any) => void | undefined) {
          cb = value;
        },
      },
    },
  }),
  onMessage: (message: any) => {
    action("onMessage")(message);
    return cb?.(message);
  },
};

export const SourceCode: Story<Props> = args => <Component {...args} />;

SourceCode.args = {
  sourceCode: `console.log("Hello")`,
  exposed: {
    "console.log": action("console.log"),
  },
};
