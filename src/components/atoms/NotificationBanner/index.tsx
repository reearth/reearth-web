import React, { useState, useEffect } from "react";

// Components
import Icon from "@reearth/components/atoms/Icon";
import Text from "@reearth/components/atoms/Text";
import Flex from "@reearth/components/atoms/Flex";

// Theme
import { styled, metrics, useTheme } from "@reearth/theme";

export type Type = "error" | "warning" | "info" | "success";

interface NotificationBannerProps {
  notification: {
    type: Type;
    heading: string;
    text: string;
  };
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
  const { type, heading, text } = notification;
  const [visibility, changeVisibility] = useState(!hidden);
  useEffect(() => {
    changeVisibility(!hidden);
  }, [hidden, text]);

  return visibility && (text || children) && type ? (
    <StyledNotificationBanner type={type} direction="column">
      <HeadingArea justify="space-between">
        <Text
          size="m"
          color={theme.notification.text}
          weight="bold"
          otherProperties={{ padding: "0 0 8px 0" }}>
          {heading}
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
      <WarningArea size="s" color={theme.notification.text}>
        {text || children}
      </WarningArea>
    </StyledNotificationBanner>
  ) : null;
};

const StyledNotificationBanner = styled(Flex)<{
  type?: Type;
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
  z-index: ${props => props.theme.zIndexes.notificationBar};
`;

const HeadingArea = styled(Flex)`
  width: 100%;
`;

const WarningArea = styled(Text)``;

const CloseBtn = styled(Icon)`
  // position: absolute;
  // right: 12px;
  // top: 8px;
  cursor: pointer;
`;

export default NotificationBanner;
