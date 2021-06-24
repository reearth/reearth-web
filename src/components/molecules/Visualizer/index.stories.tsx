import React from "react";
import { Meta, Story } from "@storybook/react";
import Earth, { Primitive, Widget, Props } from ".";

export default {
  title: "molecules/Visualizer",
  component: Earth,
  argTypes: {
    onBlockChange: { action: "onBlockChange" },
    onBlockDelete: { action: "onBlockDelete" },
    onBlockMove: { action: "onBlockMove" },
    onBlockInsert: { action: "onBlockInsert" },
    onBlockSelect: { action: "onBlockSelect" },
  },
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

const primitives: Primitive[] = [
  {
    id: "1",
    plugin: "reearth/marker",
    title: "hoge",
    isVisible: true,
    property: {
      default: {
        location: { lat: 35.3929, lng: 139.4428 },
        height: 0,
      },
    },
  },
  {
    id: "2",
    plugin: "reearth/marker",
    title: "hoge",
    isVisible: true,
    property: {
      default: {
        location: { lat: 34.3929, lng: 139.4428 },
        height: 0,
      },
    },
    infobox: {
      blocks: [
        {
          id: "1",
          plugin: "reearth/textblock",
          property: {
            default: {
              text: "```\naaaaa\n```",
              markdown: true,
            },
          },
        },
      ],
      property: {
        default: {
          title: "Foo",
          bgcolor: "#0ff",
        },
      },
    },
  },
];

const widgets: Widget[] = [];

const Template: Story<Props> = args => <Earth {...args} />;

export const Default = Template.bind({});
Default.args = {
  engine: "cesium",
  rootLayerId: "root",
  primitives,
  widgets,
  sceneProperty: {
    tiles: [{ id: "default", tile_type: "default" }],
  },
  selectedPrimitive: undefined,
  selectedBlockId: undefined,
  ready: true,
  isEditable: true,
  isBuilt: false,
  small: false,
};

export const Selected = Template.bind({});
Selected.args = {
  ...Default.args,
  selectedPrimitive: primitives[1],
};
