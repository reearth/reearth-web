import React from "react";
import { Meta, Story } from "@storybook/react";
import { V, location } from "../storybook";
import Resource, { Props } from ".";

export default {
  title: "molecules/Visualizer/Engine/Cesium/Resource",
  component: Resource,
  argTypes: { onSelect: { action: "onSelect" } },
} as Meta;

export const Default: Story<Props> = args => (
  <V location={location}>
    <Resource {...args} />
  </V>
);

Default.args = {
  primitive: {
    id: "",
    isVisible: true,
    property: {
      default: {
        url: "/sample.geojson",
      },
    },
  },
  isBuilt: false,
  isEditable: false,
  isSelected: false,
};
