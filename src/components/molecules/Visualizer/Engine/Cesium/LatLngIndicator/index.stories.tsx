import React from "react";

import { Meta, Story } from "@storybook/react";
import LatLngIndicator, { Props } from ".";

export default {
  title: "molecules/Visualizer/Engine/Cesium/LatLngIndicator",
  component: LatLngIndicator,
} as Meta;

export const Default: Story<Props> = args => <LatLngIndicator {...args} />;

Default.args = {
  lat: 90.01,
  lng: 45.01,
};
