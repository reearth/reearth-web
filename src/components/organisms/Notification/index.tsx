import React from "react";

import MoleculeNotificationBanner from "@reearth/components/molecules/Common/Notification";

import useHooks from "./hooks";

const NotificationBanner: React.FC = () => {
  const { visible, changeVisibility, notification, resetNotification } = useHooks();

  return (
    <MoleculeNotificationBanner
      visible={visible}
      changeVisibility={changeVisibility}
      notification={notification}
      resetNotification={resetNotification}
    />
  );
};

export default NotificationBanner;
