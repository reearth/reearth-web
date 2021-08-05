import React from "react";
import { Meta, Story } from "@storybook/react";

import Component, { Props } from ".";
import { V, location } from "../storybook";

export default {
  title: "molecules/Visualizer/Engine/Cesium/Model",
  component: Component,
} as Meta;

const Template: Story<Props> = args => (
  <V>
    <Component {...args} />
  </V>
);

export const Default = Template.bind({});
Default.args = {
  ...Template.args,
  primitive: {
    id: "",
    isVisible: true,
    property: {
      default: {
        location,
        scale: 1000,
        model: `${process.env.PUBLIC_URL}/BoxAnimated.glb`,
      },
    },
  },
};

export const Appearance = Template.bind({});
Appearance.args = {
  ...Template.args,
  primitive: {
    id: "",
    isVisible: true,
    property: {
      default: {
        location,
        scale: 1000,
        model: `${process.env.PUBLIC_URL}/BoxAnimated.glb`,
        animation: false,
      },
      appearance: {
        color: "red",
        colorBlend: "mix",
        colorBlendAmount: 0.5,
        silhouette: true,
        silhouetteColor: "yellow",
        silhouetteSize: 10,
      },
    },
  },
};

export const Rotated = Template.bind({});
Rotated.args = {
  ...Template.args,
  primitive: {
    id: "",
    isVisible: true,
    property: {
      default: {
        location,
        scale: 1000,
        heading: 130,
        model: `${process.env.PUBLIC_URL}/BoxAnimated.glb`,
      },
    },
  },
};
