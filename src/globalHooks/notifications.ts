import { useMemo, useEffect, useCallback } from "react";
import { useIntl } from "react-intl";
import { useError, useNotification } from "@reearth/state";
import { Type as NotificationType } from "@reearth/components/atoms/NotificationBanner";

export default () => {
  const intl = useIntl();
  const [notification, setNotification] = useNotification();
  const [error, setError] = useError();
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

  const closeNotification = useCallback(() => {
    if (error) {
      setError(undefined);
    }
  }, [error, setError]);

  const notify = useCallback(
    (type?: NotificationType, text?: string) => {
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

  useEffect(() => {
    if (!notification?.text) return;
    const timerID = setTimeout(() => setNotification(undefined), notificationTimeout);
    return () => clearTimeout(timerID);
  }, [notification?.text, setNotification]);

  return {
    notification,
    notify,
    closeNotification,
  };
};
