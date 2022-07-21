import { memo } from "react";

import { useT } from "@reearth/i18n";
import { styled } from "@reearth/theme";

import Icon from "../Icon";
import Text from "../Text";

import { BORDER_WIDTH, PADDING_HORIZONTAL, KNOB_SIZE } from "./constants";
import { useTimeline } from "./hooks";
import ScaleList from "./ScaleList";
import { Range, TimeEventHandler } from "./types";

export type Props = {
  /**
   * @description
   * This value need to be epoch time.
   */
  currentTime: number;
  /**
   * @description
   * These value need to be epoch time.
   */
  range?: { [K in keyof Range]?: Range[K] };
  onClick?: TimeEventHandler;
  onDrag?: TimeEventHandler;
  onPlay?: TimeEventHandler;
  onOpen?: () => void;
  onClose?: () => void;
  isOpened?: boolean;
  themeColor?: string;
};

const Timeline: React.FC<Props> = memo(
  function TimelinePresenter({
    currentTime,
    range,
    onClick,
    onDrag,
    onPlay,
    isOpened,
    onOpen,
    onClose,
    themeColor,
  }) {
    const {
      startDate,
      scaleCount,
      hoursCount,
      gapHorizontal,
      scaleInterval,
      strongScaleHours,
      currentPosition,
      events,
      player: {
        playSpeed,
        onPlaySpeedChange,
        formattedCurrentTime,
        isPlaying,
        isPlayingReversed,
        toggleIsPlaying,
        toggleIsPlayingReversed,
      },
    } = useTimeline({
      currentTime,
      range,
      onClick,
      onDrag,
      onPlay,
    });
    const t = useT();

    return isOpened ? (
      <Container>
        <CloseButton themeColor={themeColor} onClick={onClose}>
          <Icon alt={t("Close timeline")} icon="cancel" size={16} />
        </CloseButton>
        <ToolBox>
          <li>
            <PlayButton
              themeColor={themeColor}
              isPlaying={isPlayingReversed}
              onClick={toggleIsPlayingReversed}>
              <Icon alt={t("Playback timeline")} icon="playLeft" size={16} />
            </PlayButton>
          </li>
          <li>
            <PlayButton
              isRight
              themeColor={themeColor}
              isPlaying={isPlaying}
              onClick={toggleIsPlaying}>
              <Icon alt={t("Play timeline")} icon="playRight" size={16} />
            </PlayButton>
          </li>
          <li>
            <InputRangeLabel>
              <InputRangeLabelText size="xs">{playSpeed}X</InputRangeLabelText>
              <InputRange
                themeColor={themeColor}
                type="range"
                max={10000}
                min={1}
                value={playSpeed * 10}
                onChange={onPlaySpeedChange}
              />
            </InputRangeLabel>
          </li>
        </ToolBox>
        <CurrentTime size="xs" weight="bold">
          {formattedCurrentTime}
        </CurrentTime>
        {/**
         * TODO: Support keyboard operation for accessibility
         * see: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/slider_role
         */}
        <ScaleBox role="slider" {...events}>
          <ScaleList
            start={startDate}
            scaleCount={scaleCount}
            hoursCount={hoursCount}
            gapHorizontal={gapHorizontal}
            scaleInterval={scaleInterval}
            strongScaleHours={strongScaleHours}
          />
          <IconWrapper
            data-testid="knob-icon"
            themeColor={themeColor}
            style={{
              left: currentPosition + PADDING_HORIZONTAL - KNOB_SIZE / 2,
            }}>
            <Icon icon="ellipse" alt={t("ellipse")} size={KNOB_SIZE} />
          </IconWrapper>
        </ScaleBox>
      </Container>
    ) : (
      <OpenButton onClick={onOpen}>
        <Icon alt={t("Open timeline")} icon="timeline" size={24} />
      </OpenButton>
    );
  },
  (prev, next) => prev.currentTime === next.currentTime && prev.isOpened === next.isOpened,
);

type StyledColorProps = {
  themeColor: string | undefined;
};

const Container = styled.div`
  background: ${({ theme }) => theme.main.deepBg};
  width: 100%;
  display: flex;
  box-sizing: border-box;
`;

const OpenButton = styled.button`
  background: ${({ theme }) => theme.main.deepBg};
  color: ${({ theme }) => theme.main.text};
  padding: 8px 12px;
`;

const CloseButton = styled.button<StyledColorProps>`
  background: ${({ theme, themeColor }) => themeColor || theme.main.select};
  padding: 4px;
  color: ${({ theme }) => theme.main.text};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
`;

const ToolBox = styled.ul`
  display: flex;
  align-items: center;
  margin: ${({ theme }) =>
    `${theme.metrics.s}px ${theme.metrics.s}px ${theme.metrics.s}px ${theme.metrics.l}px`};
  list-style: none;
  padding: 0;
`;

const PlayButton = styled.button<{ isRight?: boolean; isPlaying?: boolean } & StyledColorProps>`
  border-radius: 50%;
  width: 24px;
  height: 24px;
  border: ${({ theme }) => `1px solid ${theme.main.weak}`};
  color: ${({ theme }) => theme.main.text};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: ${({ isRight, theme }) => (isRight ? `${theme.metrics.s}px` : 0)};
  background: ${({ isPlaying, themeColor, theme }) =>
    isPlaying ? themeColor || theme.main.select : "transparent"};
`;

const InputRangeLabel = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: ${({ theme }) => `0 ${theme.metrics.s}px 0 ${theme.metrics.m}px`};
`;

const InputRangeLabelText = styled(Text)`
  color: ${({ theme }) => theme.main.text};
  /* space for preventing layout shift by increasing speed label. */
  width: 37px;
  text-align: right;
  margin-right: ${({ theme }) => theme.metrics.s}px;
`;

const InputRange = styled.input<StyledColorProps>`
  -webkit-appearance: none;
  background: ${({ theme }) => theme.main.weak};
  height: 1px;
  width: 100px;
  border: none;
  ::-webkit-slider-thumb {
    -webkit-appearance: none;
    background: ${({ theme, themeColor }) => themeColor || theme.main.select};
    height: 10px;
    width: 10px;
    border-radius: 50%;
  }
`;

const CurrentTime = styled(Text)`
  border: ${({ theme }) => `1px solid ${theme.main.weak}`};
  border-radius: 5px;
  color: ${({ theme }) => theme.main.text};
  padding: ${({ theme }) => `0 ${theme.metrics.s}px`};
  margin: ${({ theme }) => `${theme.metrics.s}px 0`};
`;

const ScaleBox = styled.div`
  border: ${({ theme }) => `${BORDER_WIDTH}px solid ${theme.colors.publish.dark.icon.weak}`};
  border-radius: 5px;
  box-sizing: border-box;
  position: relative;
  overflow-x: auto;
  overflow-y: hidden;
  width: 100%;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  ::-webkit-scrollbar {
    height: 5px;
  }
  ::-webkit-scrollbar-track {
    background-color: transparent;
  }
  ::-webkit-scrollbar-thumb {
    border-radius: 5px;
    background-color: ${({ theme }) => theme.colors.publish.dark.icon.main};
  }
  margin: ${({ theme }) => `${theme.metrics.s}px 0 ${theme.metrics.s}px ${theme.metrics.xs}px`};
`;

const IconWrapper = styled.div<StyledColorProps>`
  position: absolute;
  top: 2px;
  color: ${({ theme, themeColor }) => themeColor || theme.main.select};
`;

export default Timeline;
