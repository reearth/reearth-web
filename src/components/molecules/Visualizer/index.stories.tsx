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
    infobox: {},
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

const widgets: Widget[] = [
  {
    id: "a",
    plugin: "reearth/splashscreen",
    property: {
      overlay: {
        overlayEnabled: true,
        overlayDuration: 2,
        overlayTransitionDuration: 1,
        overlayImage: `${process.env.PUBLIC_URL}/sample.svg`,
        overlayImageW: 648,
        overlayImageH: 432,
        overlayBgcolor: "#fff8",
      },
    },
  },
];

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
  selectedPrimitiveId: undefined,
  selectedBlockId: undefined,
  ready: true,
  isEditable: true,
  isBuilt: false,
  small: false,
};

export const Selected = Template.bind({});
Selected.args = {
  ...Default.args,
  primitives: Default.args.primitives?.map(p => ({ ...p, infoboxEditable: true })),
  selectedPrimitiveId: primitives[1].id,
};

export const Built = Template.bind({});
Built.args = {
  ...Default.args,
  isEditable: false,
  isBuilt: true,
};
