import React from "react";
import { useMedia } from "react-use";

import { metricsSizes, styled, useTheme } from "@reearth/theme";

import Text from "../Text";

export type Props = {
  size?: number;
  avatar?: string;
  color?: string;
  userName?: string;
  innerText?: string;
};

const Avatar: React.FC<Props> = ({ size = 24, avatar, color, userName, innerText }) => {
  const theme = useTheme();
  const isSmallWindow = useMedia("(max-width: 1024px)");
  return (
    <div>
      <StyledAvatar size={size} avatar={avatar} color={color}>
        {userName && (
          <Text size={isSmallWindow ? "m" : "l"} color={theme.text.pale}>
            {userName?.charAt(0).toUpperCase()}
          </Text>
        )}
        {innerText && (
          <Text size={isSmallWindow ? "m" : "l"} color={theme.text.pale}>
            {innerText}
          </Text>
        )}
      </StyledAvatar>
    </div>
  );
};
const StyledAvatar = styled.div<{
  size?: number;
  avatar?: string;
  color?: string;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-direction: center;
  padding: 0px;
  position: relative;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  min-width: ${({ size }) => size}px;
  min-height: ${({ size }) => size}px;
  border-radius: 50%;
  background: ${({ avatar, color }) => (avatar ? `url(${avatar});` : color)};
  margin: 0 ${metricsSizes["xs"]}px;
`;

export default Avatar;
