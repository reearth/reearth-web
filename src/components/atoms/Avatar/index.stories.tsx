import { Meta } from "@storybook/react";
import React from "react";

import Avatar from ".";

export default {
  title: "atoms/Avatar",
  component: Avatar,
} as Meta;

export const Default = () => <Avatar size={24} />;
