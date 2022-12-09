import { Meta, Story } from "@storybook/react";

import Component, { Props } from "../../Map";

import { engine } from ".";

export default {
  title: "core/engines/Cesium",
  component: Component,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

const Template: Story<Props> = args => <Component {...args} />;

export const Default = Template.bind([]);
Default.args = {
  engine: "cesium",
  engines: {
    cesium: engine,
  },
  ready: true,
  layers: [
    {
      id: "l",
      type: "simple",
      data: {
        type: "geojson",
        value: { type: "Feature", geometry: { type: "Point", coordinates: [0, 0] } },
      },
      marker: {
        pointColor: "#fff",
        pointSize: 30,
      },
    },
  ],
  property: {
    tiles: [
      {
        id: "default",
        tile_type: "default",
      },
    ],
  },
};