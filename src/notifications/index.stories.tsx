import React from "react";
import { Meta } from "@storybook/react";
import NotificationBanner from ".";
import useHooks from "./hooks";

export default {
  title: "notifications/NotificationBanner",
  component: NotificationBanner,
} as Meta;

export const Success = () => {
  const { notify } = useHooks();
  notify("success", "Successfully completed something cool!");
  return <NotificationBanner />;
};
export const Error = () => {
  const { notify } = useHooks();
  notify("error", "Oh no! Some error happened...");
  return <NotificationBanner />;
};
export const Warning = () => {
  const { notify } = useHooks();
  notify("warning", "Ah, looks like I need to warn you about something.");
  return <NotificationBanner />;
};
export const Info = () => {
  const { notify } = useHooks();
  notify("info", "This is some info you might find interesting.");
  return <NotificationBanner />;
};
