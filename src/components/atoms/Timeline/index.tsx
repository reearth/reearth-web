import { memo, ReactElement, useMemo } from "react";

import { styled } from "@reearth/theme";

import {
  BORDER_WIDTH,
  DAY_SECS,
  EPOCH_SEC,
  GAP_HORIZONTAL,
  HOURS_SECS,
  MAX_ZOOM_RATIO,
  SCALE_INTERVAL,
  SCALE_ZOOM_INTERVAL,
  MINUTES_SEC,
  NORMAL_SCALE_WIDTH,
  PADDING_HORIZONTAL,
  STRONG_SCALE_WIDTH,
} from "./constants";
import { useTimelineInteraction } from "./hooks";
import { ScaleList } from "./ScaleList";
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
  renderKnob: () => ReactElement;
  knobSize: number;
  onClick?: TimeEventHandler;
  onDrag?: TimeEventHandler;
};

const getRange = (range: Props["range"]): Range => {
  const { start, end } = range || {};
  if (start !== undefined && end !== undefined) {
    return { start, end };
  }

  if (start !== undefined && end === undefined) {
    return {
      start,
      end: start + DAY_SECS,
    };
  }

  if (start === undefined && end !== undefined) {
    return {
      start: Math.max(end - DAY_SECS, 0),
      end,
    };
  }

  const defaultStart = Date.now();

  return {
    start: defaultStart,
    end: defaultStart + DAY_SECS * EPOCH_SEC,
  };
};

const Timeline: React.FC<Props> = memo(
  function TimelinePresenter({
    currentTime,
    range: _range,
    renderKnob,
    knobSize,
    onClick,
    onDrag,
  }) {
    const range = useMemo(() => {
      const range = getRange(_range);
      if (process.env.NODE_ENV !== "production") {
        if (range.start > range.end) {
          throw new Error("Out of range error. `range.start` should be less than `range.end`");
        }
      }
      return range;
    }, [_range]);
    const { start, end } = range;
    const { zoom, events } = useTimelineInteraction({ range, onClick, onDrag });
    const gapHorizontal = GAP_HORIZONTAL * (zoom - Math.trunc(zoom) + 1);
    const scaleInterval = Math.max(
      SCALE_INTERVAL - Math.trunc(zoom - 1) * SCALE_ZOOM_INTERVAL * MINUTES_SEC,
      MINUTES_SEC,
    );
    const strongScaleHours = MAX_ZOOM_RATIO - Math.trunc(zoom) + 1;
    const epochDiff = end - start;

    // convert epoch diff to second.
    const scaleCount = useMemo(
      () => Math.trunc(epochDiff / EPOCH_SEC / scaleInterval),
      [epochDiff, scaleInterval],
    );

    const startDate = useMemo(() => new Date(start), [start]);
    const hoursCount = Math.trunc(HOURS_SECS / scaleInterval);
    // Convert scale count to pixel.
    const currentPosition = useMemo(() => {
      const diff = Math.min((currentTime - start) / EPOCH_SEC / scaleInterval, scaleCount);
      const strongScaleCount = diff / (hoursCount * strongScaleHours);
      return Math.max(
        diff * gapHorizontal +
          (diff - strongScaleCount) * NORMAL_SCALE_WIDTH +
          strongScaleCount * STRONG_SCALE_WIDTH +
          STRONG_SCALE_WIDTH / 2,
        0,
      );
    }, [
      currentTime,
      start,
      scaleCount,
      hoursCount,
      gapHorizontal,
      scaleInterval,
      strongScaleHours,
    ]);

    return (
      <Container>
        <ScaleBox {...events}>
          <ScaleList
            start={startDate}
            scaleCount={scaleCount}
            hoursCount={hoursCount}
            gapHorizontal={gapHorizontal}
            scaleInterval={scaleInterval}
            strongScaleHours={strongScaleHours}
          />
          <Icon
            style={{
              left: currentPosition + PADDING_HORIZONTAL - knobSize / 2,
            }}>
            {renderKnob()}
          </Icon>
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
  border: ${BORDER_WIDTH}px solid ${({ theme }) => theme.colors.publish.dark.icon.weak};
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

const Icon = styled.div`
  position: absolute;
  top: 2px;
  color: ${({ theme }) => theme.colors.publish.dark.other.select};
`;

export default Timeline;
