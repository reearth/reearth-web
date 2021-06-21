import React from "react";
import { Meta, Story } from "@storybook/react";

import { V, location } from "../storybook";
import Marker, { Props } from ".";

export default {
  title: "molecules/Visualizer/Engine/Cesium/Marker",
  component: Marker,
  argTypes: { onSelect: { action: "onSelect" } },
} as Meta;

const Template: Story<Props> = args => (
  <V>
    <Marker {...args} />
  </V>
);

export const Point = Template.bind({});
Point.args = {
  primitive: {
    id: "",
    isVisible: true,
    property: {
      default: {
        location,
        height: location.height,
        style: "point",
        pointColor: "blue",
        pointSize: 50,
      },
    },
  },
};

export const PointWithLabelAndExcluded = Template.bind({});
PointWithLabelAndExcluded.args = {
  primitive: {
    id: "",
    isVisible: true,
    property: {
      default: {
        location,
        height: location.height,
        style: "point",
        pointColor: "blue",
        pointSize: 50,
        extrude: true,
        label: true,
        labelText: "label",
      },
    },
  },
};

export const PointWithRightLabel = Template.bind({});
PointWithRightLabel.args = {
  primitive: {
    id: "",
    isVisible: true,
    property: {
      default: {
        location,
        height: location.height,
        style: "point",
        label: true,
        labelText: "label",
        labelPosition: "right",
        labelTypography: {
          fontSize: 15,
          color: "red",
          bold: true,
          italic: true,
          fontFamily: "serif",
        },
      },
    },
  },
};

export const PointWithTopLabel = Template.bind({});
PointWithTopLabel.args = {
  primitive: {
    id: "",
    isVisible: true,
    property: {
      default: {
        location,
        height: location.height,
        style: "point",
        label: true,
        labelText: "label",
        labelPosition: "top",
        labelTypography: {
          fontFamily: "serif",
        },
      },
    },
  },
};

export const PointWithBottomLabel = Template.bind({});
PointWithBottomLabel.args = {
  primitive: {
    id: "",
    isVisible: true,
    property: {
      default: {
        location,
        height: location.height,
        style: "point",
        label: true,
        labelText: "label",
        labelPosition: "bottom",
      },
    },
  },
};

export const Image = Template.bind({});
Image.args = {
  primitive: {
    id: "",
    isVisible: true,
    property: {
      default: {
        location,
        height: location.height,
        style: "image",
        image: "/sample.svg",
        imageSize: 0.01,
      },
    },
  },
};

export const ImageWithShadow = Template.bind({});
ImageWithShadow.args = {
  primitive: {
    id: "",
    isVisible: true,
    property: {
      default: {
        location,
        height: location.height,
        style: "image",
        image: "/sample.svg",
        imageSize: 0.02,
        imageShadow: true,
      },
    },
  },
};

export const ImageWithCropAndShadow = Template.bind({});
ImageWithCropAndShadow.args = {
  primitive: {
    id: "",
    isVisible: true,
    property: {
      default: {
        location,
        height: location.height,
        style: "image",
        image: "/sample.svg",
        imageSize: 0.012,
        imageCrop: "circle",
        imageShadow: true,
        extrude: true,
      },
    },
  },
};
