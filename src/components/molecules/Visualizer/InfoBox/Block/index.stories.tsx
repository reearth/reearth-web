import React from "react";
import { Meta, Story } from "@storybook/react";
import InfoboxBlock, { Block, Props } from ".";

const block: Block = {
  plugin: "reearth/textblock",
  id: "block",
  property: {
    default: {
      title: "Text",
      text: "texttexttext",
    },
  },
};

export default {
  title: "molecules/Visualizer/InfoBox/Block",
  component: InfoboxBlock,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

export const Default: Story<Props> = args => <InfoboxBlock {...args} />;
Default.args = {
  block,
  isEditable: false,
  isBuilt: false,
};
