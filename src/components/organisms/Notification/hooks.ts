import { useState, useEffect, useCallback, useMemo } from "react";

import { useT } from "@reearth/i18n";
import { useError, useNotification, Notification } from "@reearth/state";

const notificationTimeout = 5000;

export default () => {
  const t = useT();
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
    if (error.includes("policy violation")) {
      setNotification({
        type: "info",
        heading: noticeHeading,
        text: t(
          `Your workspace has reached its limit for this action. Please check reearth.io for details.`,
        ),
      });
    } else {
      setNotification({
        type: "error",
        heading: errorHeading,
        text: t("Something went wrong. Please try again later."),
      });
    }
    setError(undefined);
  }, [error, setError, errorHeading, noticeHeading, setNotification, t]);

  useEffect(() => {
    if (!notification) return;
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
