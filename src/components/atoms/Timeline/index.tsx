import { memo } from "react";

import { styled } from "@reearth/theme";

import Icon from "../Icon";

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
};

const Timeline: React.FC<Props> = memo(
  function TimelinePresenter({ currentTime, range, onClick, onDrag }) {
    const {
      startDate,
      scaleCount,
      hoursCount,
      gapHorizontal,
      scaleInterval,
      strongScaleHours,
      currentPosition,
      events,
    } = useTimeline({
      currentTime,
      range,
      onClick,
      onDrag,
    });

    return (
      <Container>
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
            style={{
              left: currentPosition + PADDING_HORIZONTAL - KNOB_SIZE / 2,
            }}>
            <Icon icon="ellipse" alt="ellipse" size={KNOB_SIZE} />
          </IconWrapper>
        </ScaleBox>
      </Container>
    );
  },
  (prev, next) => prev.currentTime === next.currentTime,
);

const Container = styled.div`
  background: ${({ theme }) => theme.colors.publish.dark.other.background};
  width: 100%;
  display: flex;
  align-items: center;
  padding: ${({ theme }) => `${theme.metrics.m}px ${theme.metrics.xs}px`};
  box-sizing: border-box;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
`;

const ScaleBox = styled.div`
  border: ${({ theme }) => `${BORDER_WIDTH}px solid ${theme.colors.publish.dark.icon.weak}`};
  border-radius: 5px;
  box-sizing: border-box;
  position: relative;
  overflow-x: auto;
  overflow-y: hidden;
  width: 100%;
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
`;

const IconWrapper = styled.div`
  position: absolute;
  top: 2px;
  color: ${({ theme }) => theme.colors.publish.dark.other.select};
`;

export default Timeline;
