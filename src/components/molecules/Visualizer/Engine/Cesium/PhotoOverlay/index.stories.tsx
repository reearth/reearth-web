import React from "react";
import { Meta, Story } from "@storybook/react";
import { Math as CesiumMath } from "cesium";

import { V, location } from "../storybook";
import PhotoOverlay, { Props } from ".";
import { commonApi } from "../../../storybook";

export default {
  title: "molecules/Visualizer/Engine/Cesium/PhotoOverlay",
  component: PhotoOverlay,
  argTypes: {
    api: {
      control: false,
    },
  },
} as Meta;

export const Default: Story<Props> = args => (
  <V location={location}>
    <PhotoOverlay {...args} />
  </V>
);

Default.args = {
  api: commonApi,
  primitive: {
    id: "",
    isVisible: true,
    property: {
      default: {
        location,
        photoOverlayImage: `${process.env.PUBLIC_URL}/sample.svg`,
        camera: {
          ...location,
          fov: CesiumMath.toRadians(30),
          heading: 0,
          pitch: 0,
          roll: 0,
        },
      },
    },
  },
  isBuilt: false,
  isEditable: false,
  isSelected: false,
};
