import React, { useEffect, useRef } from "react";
import Player from "react-player";

import { styled } from "@reearth/theme";
import Icon from "@reearth/components/atoms/Icon";

import { Props as BlockProps } from "..";
import { Title } from "../common";

export type Props = BlockProps<Property>;

export type Property = {
  default?: {
    url?: string;
    title?: string;
    fullSize?: boolean;
  };
};

const VideoBlock: React.FC<Props> = ({
  block,
  infoboxProperty,
  isHovered,
  isSelected,
  isEditable,
  onClick,
}) => {
  const { url: videoUrl, fullSize, title } = block?.property?.default ?? {};
  const { size: infoboxSize } = infoboxProperty?.default ?? {};
  const isTemplate = !videoUrl && !title;

  const ref = useRef<Player>(null);

  useEffect(() => {
    // detect click event on video iframe
    const cb = () => {
      const player = ref.current?.getInternalPlayer() as any;
      if (!player) return;
      const internal = player.getIframe?.() as HTMLIFrameElement | undefined;
      if (document.activeElement == internal) {
        onClick?.();
      }
    };
    window.addEventListener("blur", cb);
    return () => window.removeEventListener("blur", cb);
  }, [onClick, isSelected]);

  return (
    <Wrapper
      onClick={onClick}
      fullSize={fullSize}
      isSelected={isSelected}
      isHovered={isHovered}
      isEditable={isEditable}
      isTemplate={isTemplate}
      infoboxSize={infoboxSize}>
      {title && <Title infoboxProperty={infoboxProperty}>{title}</Title>}
      {isTemplate && isEditable ? (
        <Template infoboxSize={infoboxSize}>
          <StyledIcon icon="video" isHovered={isHovered} isSelected={isSelected} size={24} />
        </Template>
      ) : (
        <Player
          ref={ref}
          url={videoUrl}
          width="100%"
          height={infoboxSize === "large" ? (title ? "326px" : "340px") : title ? "185px" : "200px"}
          playsinline
          pip
          controls
          preload
          isHovered={isHovered}
          isSelected={isSelected}
        />
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div<{
  fullSize?: boolean;
  isSelected?: boolean;
  isHovered?: boolean;
  isTemplate: boolean;
  isEditable?: boolean;
  infoboxSize?: string;
}>`
  margin: ${({ fullSize }) => (fullSize ? "0" : "0 8px")};
  border: 1px solid
    ${({ isSelected, isHovered, isTemplate, isEditable, theme }) =>
      (!isTemplate && !isHovered && !isSelected) || !isEditable
        ? "transparent"
        : isHovered
        ? theme.infoBox.border
        : isSelected
        ? theme.infoBox.accent2
        : theme.infoBox.weakText};
  border-radius: 6px;
  height: ${props => (props.infoboxSize === "large" ? "340px" : "200px")};
`;

const Template = styled.div<{ infoboxSize?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: ${props => (props.infoboxSize === "large" ? "340px" : "200px")};
  border-radius: 3px;
`;

const StyledIcon = styled(Icon)<{ isSelected?: boolean; isHovered?: boolean }>`
  color: ${props =>
    props.isHovered
      ? props.theme.infoBox.border
      : props.isSelected
      ? props.theme.infoBox.accent2
      : props.theme.infoBox.weakText};
`;

export default VideoBlock;
