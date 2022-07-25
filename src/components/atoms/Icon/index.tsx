import svgToMiniDataURI from "mini-svg-data-uri";
import React, { AriaRole, CSSProperties, memo, useMemo } from "react";
import SVG from "react-inlinesvg";

import { styled } from "@reearth/theme";

import Icons from "./icons";

export type Icons = keyof typeof Icons;

export type Props = {
  className?: string;
  icon?: string;
  size?: string | number;
  alt?: string;
  color?: string;
  style?: CSSProperties;
  role?: AriaRole;
  onClick?: () => void;
};

const Icon: React.FC<Props> = ({ className, icon, alt, style, color, size, role, onClick }) => {
  const src = useMemo(
    () => (icon?.startsWith("<svg ") ? svgToMiniDataURI(icon) : Icons[icon as Icons]),
    [icon],
  );
  if (!icon) return null;

  const sizeStr = typeof size === "number" ? `${size}px` : size;
  if (!src) {
    return <StyledImg src={icon} alt={alt} style={style} size={sizeStr} onClick={onClick} />;
  }

  return (
    <StyledSvg
      className={className}
      src={src}
      style={style}
      role={role}
      color={color}
      size={sizeStr}
      onClick={onClick}
    />
  );
};

const StyledImg = styled.img<{ size?: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
`;

const StyledSvg = styled(SVG)<{ color?: string; size?: string }>`
  font-size: 0;
  display: inline-block;
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  color: ${({ color }) => color};
`;

export default memo(Icon);
