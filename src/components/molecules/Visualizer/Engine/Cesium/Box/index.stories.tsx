import { Meta, Story } from "@storybook/react";

import { V, location } from "../storybook";

import Box, { Props } from ".";

export default {
  title: "molecules/Visualizer/Engine/Cesium/Box",
  component: Box,
} as Meta;

export const Default: Story<Props> = args => (
  <V location={location}>
    <Box {...args} />
  </V>
);

Default.args = {
  layer: {
    id: "",
    property: {
      default: {
        fillColor: "rgba(0, 0, 0, 0.5)",
        location,
        height: location.height,
        dimensions: {
          x: 1000,
          y: 1000,
          z: 1000,
        },
      },
    },
    isVisible: true,
  },
};
