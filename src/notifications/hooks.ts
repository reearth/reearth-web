import { useState, useMemo, useEffect, useCallback } from "react";
import { useIntl } from "react-intl";
import { useNotification, Notification } from "@reearth/state";

export type NotificationStyleType = "error" | "warning" | "info" | "success";
export type NotificationType = Notification;

export default () => {
  const intl = useIntl();
  const [notification, setNotification] = useNotification();
  const [visible, changeVisibility] = useState(false);
  const notificationTimeout = 5000;

  const notificationHeading = useMemo(() => {
    if (!notification) {
      return intl.formatMessage({ defaultMessage: "Notice" });
    }
    switch (notification.type) {
      case "error":
        return intl.formatMessage({ defaultMessage: "Error" });
      case "warning":
        return intl.formatMessage({ defaultMessage: "Warning" });
      default:
        return intl.formatMessage({ defaultMessage: "Notice" });
    }
  }, [intl, notification]);

  const notify = useCallback(
    (type?: NotificationStyleType, text?: string) => {
      if (!type || !text || notification?.type === "error") return;
      setNotification({
        type: type,
        heading: notificationHeading,
        text: text,
      });
    },
    [setNotification, notificationHeading, notification?.type],
  );

  useEffect(() => {
    changeVisibility(!!notification);
  }, [notification]);

  useEffect(() => {
    if (!notification) return;
    const timerID = setTimeout(() => {
      changeVisibility(false);
    }, notificationTimeout);
    return () => clearTimeout(timerID);
  }, [notification]);

  return {
    visible,
    changeVisibility,
    notify,
    notification,
    setNotification,
  };
};
