import { useState, useMemo, useEffect, useCallback } from "react";
import { useIntl } from "react-intl";
import { useNotification } from "@reearth/state";
import { NotificationStyleType } from "@reearth/components/molecules/Common/Notification";

export const notificationTimeout = 5000;

export default () => {
  const intl = useIntl();
  const [notification, setNotification] = useNotification();
  const [visible, changeVisibility] = useState(false);

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

  const resetNotification = useCallback(() => setNotification(undefined), [setNotification]);

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
    resetNotification,
  };
};
