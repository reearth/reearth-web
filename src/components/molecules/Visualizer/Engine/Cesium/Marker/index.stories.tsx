import React from "react";
import { Meta, Story } from "@storybook/react";

import Marker, { Props } from ".";
import { V, location } from "../storybook";

export default {
  title: "molecules/Visualizer/Engine/Cesium/Marker",
  component: Marker,
} as Meta;

const Template: Story<Props> = args => (
  <V>
    <Marker {...args} />
  </V>
);

export const Point = Template.bind({});
Point.args = {
  ...Template.args,
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
  ...Template.args,
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
  ...Template.args,
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
  ...Template.args,
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
  ...Template.args,
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
  ...Template.args,
  primitive: {
    id: "",
    isVisible: true,
    property: {
      default: {
        location,
        height: location.height,
        style: "image",
        image: `${process.env.PUBLIC_URL}/sample.svg`,
      },
    },
  },
};

export const ImageWithShadow = Template.bind({});
ImageWithShadow.args = {
  ...Template.args,
  primitive: {
    id: "",
    isVisible: true,
    property: {
      default: {
        location,
        height: location.height,
        style: "image",
        image: `${process.env.PUBLIC_URL}/sample.png`,
        imageShadow: true,
      },
    },
  },
};

export const ImageWithCropAndShadow = Template.bind({});
ImageWithCropAndShadow.args = {
  ...Template.args,
  primitive: {
    id: "",
    isVisible: true,
    property: {
      default: {
        location,
        height: location.height,
        style: "image",
        image: `${process.env.PUBLIC_URL}/sample.png`,
        imageCrop: "circle",
        imageShadow: true,
        extrude: true,
      },
    },
  },
};

export const ImageWithRightLabel = Template.bind({});
ImageWithRightLabel.args = {
  ...Template.args,
  primitive: {
    id: "",
    isVisible: true,
    property: {
      default: {
        location,
        height: location.height,
        style: "image",
        image: `${process.env.PUBLIC_URL}/sample.png`,
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
