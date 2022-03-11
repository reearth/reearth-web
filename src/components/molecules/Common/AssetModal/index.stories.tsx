import { Meta, Story } from "@storybook/react";
import React, { useState } from "react";

import Component, { Props, Asset } from ".";

export default {
  title: "molecules/EarthEditor/AssetsModal",
  component: Component,
} as Meta;

const assets: Asset[] = [
  {
    url: `${process.env.PUBLIC_URL}/sample.svg`,
    name: "hoge",
    id: "hoge",
    teamId: "hoge",
    size: 4300,
    contentType: "image",
  },
  {
    url: `${process.env.PUBLIC_URL}/sample.svg`,
    name: "hoge",
    id: "hoge",
    teamId: "hoge",
    size: 1010,
    contentType: "image",
  },
  {
    url: `${process.env.PUBLIC_URL}/sample.svg`,
    name: "hoge",
    id: "hoge",
    teamId: "hoge",
    size: 100,
    contentType: "image",
  },
  {
    url: `${process.env.PUBLIC_URL}/sample.svg`,
    name: "hoge",
    id: "hoge",
    teamId: "hoge",
    size: 2400,
    contentType: "image",
  },
  {
    url: `${process.env.PUBLIC_URL}/sample.svg`,
    name: "hoge",
    id: "hoge",
    teamId: "hoge",
    size: 1300,
    contentType: "image",
  },
  {
    url: `${process.env.PUBLIC_URL}/sample.svg`,
    name: "hoge",
    id: "hoge",
    teamId: "hoge",
    size: 100,
    contentType: "image",
  },
  {
    url: "www.filelocation.com/maps.kml",
    name: "hoge.kml",
    id: "hoge",
    teamId: "hoge",
    size: 100,
    contentType: "file",
  },
  {
    url: `${process.env.PUBLIC_URL}/sample.svg`,
    name: "hoge",
    id: "hoge",
    teamId: "hoge",
    size: 4300,
    contentType: "image",
  },
  {
    url: `${process.env.PUBLIC_URL}/sample.svg`,
    name: "hoge",
    id: "hoge",
    teamId: "hoge",
    size: 1010,
    contentType: "image",
  },
];

export const Image: Story<Props> = args => {
  const [isOpen, open] = useState(true);
  return <Component {...args} isOpen={isOpen} onClose={() => open(!isOpen)} />;
};
export const Selected: Story<Props> = args => {
  const [isOpen, open] = useState(true);
  return <Component {...args} isOpen={isOpen} onClose={() => open(!isOpen)} />;
};
export const Video: Story<Props> = args => {
  const [isOpen, open] = useState(true);
  return <Component {...args} isOpen={isOpen} onClose={() => open(!isOpen)} />;
};

Image.args = {
  assets,
  fileType: "image",
  smallCardOnly: true,
};

Selected.args = {
  assets,
  value: `${process.env.PUBLIC_URL}/sample.svg`,
  fileType: "image",
  smallCardOnly: true,
};

Video.args = {
  assets,
  fileType: "video",
  smallCardOnly: true,
};
