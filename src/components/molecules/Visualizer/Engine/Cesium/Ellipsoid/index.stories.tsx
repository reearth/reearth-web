import React from "react";
import { Meta, Story } from "@storybook/react";

import Ellipsoid, { Props } from ".";
import { V, location } from "../storybook";
import { commonApi } from "../../../storybook";

export default {
  title: "molecules/Visualizer/Engine/Cesium/Ellipsoid",
  component: Ellipsoid,
  argTypes: {
    api: {
      control: false,
    },
  },
} as Meta;

export const Default: Story<Props> = args => (
  <V location={location}>
    <Ellipsoid {...args} />
  </V>
);

Default.args = {
  api: commonApi,
  primitive: {
    id: "",
    property: {
      default: {
        radius: 1000,
        fillColor: "#f00a",
        position: location,
        height: location.height,
      },
    },
    isVisible: true,
  },
};
