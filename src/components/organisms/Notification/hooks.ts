import { useState, useEffect, useCallback, useMemo } from "react";

import { useT, useLang } from "@reearth/i18n";
import { useError, useNotification, Notification } from "@reearth/state";

export type PolicyItems = "layer" | "asset" | "dataset" | "project";

const policyItems: PolicyItems[] = ["layer", "asset", "dataset", "project"];

export default () => {
  const t = useT();
  const currentLanguage = useLang();
  const [error, setError] = useError();
  const [notification, setNotification] = useNotification();
  const [visible, changeVisibility] = useState(false);

  const errorHeading = t("Error");
  const warningHeading = t("Warning");
  const noticeHeading = t("Notice");

  const notificationHeading = useMemo(
    () =>
      notification?.type === "error"
        ? errorHeading
        : notification?.type === "warning"
        ? warningHeading
        : noticeHeading,
    [notification?.type, errorHeading, warningHeading, noticeHeading],
  );

  const resetNotification = useCallback(() => setNotification(undefined), [setNotification]);

  const setModal = useCallback((show: boolean) => {
    changeVisibility(show);
  }, []);

  useEffect(() => {
    if (!error) return;
    if (error.message?.includes("policy violation") && error.message) {
      const limitedItem = policyItems.find(i => error.message?.toLowerCase().includes(i));
      const message =
        limitedItem === "layer"
          ? t(
              "Your workspace has reached its limit for layers. Please check reearth.io for details.",
            )
          : limitedItem === "asset"
          ? t(
              "Your workspace has reached its limit for assets. Please check reearth.io for details.",
            )
          : limitedItem === "dataset"
          ? t(
              "Your workspace has reached its limit for dataset. Please check reearth.io for details.",
            )
          : limitedItem === "project"
          ? t(
              "Your workspace has reached its limit for projects. Please check reearth.io for details.",
            )
          : t(
              "Your workspace has reached its limit for this action. Please check reearth.io for details.",
            );

      setNotification({
        type: "info",
        heading: noticeHeading,
        text: message,
        duration: "persistent",
      });
    } else {
      setNotification({
        type: "error",
        heading: errorHeading,
        text: t("Something went wrong. Please try again later."),
      });
    }
    setError(undefined);
  }, [error, currentLanguage, setError, errorHeading, noticeHeading, setNotification, t]);

  useEffect(() => {
    if (!notification) return;
    if (notification.duration === "persistent") return;

    let notificationTimeout = 5000;
    if (notification.duration) {
      notificationTimeout = notification.duration;
    }
    const timerID = setTimeout(() => {
      changeVisibility(false);
    }, notificationTimeout);
    return () => clearTimeout(timerID);
  }, [notification]);

  useEffect(() => {
    changeVisibility(!!notification);
  }, [notification]);

  return {
    visible,
    notification: {
      type: notification?.type,
      heading: notificationHeading,
      text: notification?.text,
    } as Notification,
    setModal,
    resetNotification,
  };
};
