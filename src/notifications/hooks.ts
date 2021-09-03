import { useMemo, useEffect, useCallback } from "react";
import { useIntl } from "react-intl";
import { useError, useNotification, Notification } from "@reearth/state";

export type NotificationStyleType = "error" | "warning" | "info" | "success";
export type NotificationType = Notification;

export default () => {
  const intl = useIntl();
  const [notification, setNotification] = useNotification();
  const [error, setError] = useError();
  const notificationTimeout = 6000;

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
      if (!type || !text) return;
      setNotification({
        type: type,
        heading: notificationHeading,
        text: text,
      });
    },
    [setNotification, notificationHeading],
  );

  useEffect(() => {
    if (!error) return;
    setNotification({
      type: "error",
      heading: notificationHeading,
      text: error,
    });
    const timerID = setTimeout(() => {
      setError(undefined);
    }, notificationTimeout);
    return () => clearTimeout(timerID);
  }, [error, setError, notificationHeading, setNotification]);

  return {
    notification,
    notify,
  };
};
