import React from "react";
import { Meta } from "@storybook/react";
import NotificationBanner from ".";

export default {
  title: "atoms/NotificationBanner",
  component: NotificationBanner,
} as Meta;

export const Info = () => <NotificationBanner text="Successfully done" />;
export const Error = () => <NotificationBanner type={"error"} text="Error!" />;
export const Warning = () => (
  <NotificationBanner type={"warning"} text="This API is deprecated!!" />
);
