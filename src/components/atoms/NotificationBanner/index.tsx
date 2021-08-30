import React, { useState, useEffect } from "react";

import Icon from "@reearth/components/atoms/Icon";
import Text from "@reearth/components/atoms/Text";
import Flex from "@reearth/components/atoms/Flex";

import { styled, metrics, useTheme } from "@reearth/theme";
import { NotificationType as Type, NotificationStyleType as StyleType } from "@reearth/globalHooks";

export type NotificationType = Type;
export type NotificationStyleType = StyleType;

interface NotificationBannerProps {
  notification?: NotificationType;
  hidden?: boolean;
  onClose?: () => void;
}

const NotificationBanner: React.FC<NotificationBannerProps> = ({
  notification,
  hidden,
  children,
  onClose,
}) => {
  const theme = useTheme();
  const [visible, changeVisibility] = useState(!hidden);
  useEffect(() => {
    changeVisibility(!hidden);
  }, [hidden]);

  useEffect(() => {
    if (hidden) return;
    const timerID = setTimeout(() => {
      changeVisibility(false);
    }, 5000);
    return () => clearTimeout(timerID);
  }, [hidden]);

  return (
    <StyledNotificationBanner visible={visible} type={notification?.type} direction="column">
      <HeadingArea justify="space-between">
        <Text
          size="m"
          color={theme.notification.text}
          weight="bold"
          otherProperties={{ padding: "0 0 8px 0" }}>
          {notification?.heading}
        </Text>
        <CloseBtn
          icon="cancel"
          size={20}
          onClick={() => {
            changeVisibility(false);
            onClose?.();
          }}
        />
      </HeadingArea>
      <Text size="s" color={theme.notification.text}>
        {notification?.text || children}
      </Text>
    </StyledNotificationBanner>
  );
};

const StyledNotificationBanner = styled(Flex)<{
  type?: NotificationStyleType;
  visible?: boolean;
}>`
  position: absolute;
  top: ${metrics.headerHeight}px;
  right: 0;
  width: 312px;
  padding: 8px 12px;
  background-color: ${({ type, theme }) =>
    type === "error"
      ? theme.notification.errorBg
      : type === "warning"
      ? theme.notification.warningBg
      : type === "success"
      ? theme.notification.successBg
      : theme.notification.infoBg};
  color: ${({ theme }) => theme.notification.text};
  z-index: ${({ theme, visible }) => (visible ? theme.zIndexes.notificationBar : 0)};
  opacity: ${({ visible }) => (visible ? "1" : "0")};
  transition: all 0.5s;
  pointer-event: ${({ visible }) => (visible ? "auto" : "none")};
`;

const HeadingArea = styled(Flex)`
  width: 100%;
`;

const CloseBtn = styled(Icon)`
  cursor: pointer;
`;

export default NotificationBanner;
