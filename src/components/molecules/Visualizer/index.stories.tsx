import React from "react";
import { Meta, Story } from "@storybook/react";
import Earth, { Primitive, Props } from ".";

export default {
  title: "molecules/Visualizer",
  component: Earth,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

export const Cesium: Story<Props> = args => <Earth {...args} />;

const primitives: Primitive[] = [
  {
    id: "1",
    plugin: "reearth/marker",
    title: "hoge",
    property: {
      location: { lat: 35.3929, lng: 139.4428 },
      title: "foobar",
      description: "foobar!!!",
      line: true,
    },
  },
  {
    id: "2",
    plugin: "reearth/marker",
    title: "hoge",
    property: {
      location: { lat: 34.3929, lng: 139.4428 },
      title: "foobar",
      description: "foobar!!!",
      line: true,
    },
  },
];

Cesium.args = {
  engine: "cesium",
  ready: true,
  primitives,
};
