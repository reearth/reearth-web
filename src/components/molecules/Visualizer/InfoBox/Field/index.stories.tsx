import React from "react";
import { Meta, Story } from "@storybook/react";
import Field, { Block, Props } from ".";

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
  title: "molecules/Visualizer/InfoBox/Field",
  component: Field,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

export const Default: Story<Props> = args => <Field {...args} />;
Default.args = {
  block,
  isEditable: false,
  isBuilt: false,
};
