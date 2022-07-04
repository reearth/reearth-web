import { memo, ReactElement, useMemo } from "react";

import { styled } from "@reearth/theme";
import { XXSRegular } from "@reearth/theme/fonts";

import {
  BORDER_WIDTH,
  DAY_SECS,
  EPOCH_SEC,
  GAP_HORIZONTAL,
  HOURS_SECS,
  MAX_ZOOM_RATIO,
  MEMORY_INTERVAL,
  MEMORY_ZOOM_INTERVAL,
  MINUTES_SEC,
  NORMAL_MEMORY_WIDTH,
  PADDING_HORIZONTAL,
  STRONG_MEMORY_WIDTH,
} from "./constants";
import { useTimelineInteraction } from "./hooks";
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
    const memoryInterval = Math.max(
      MEMORY_INTERVAL - Math.trunc(zoom - 1) * MEMORY_ZOOM_INTERVAL * MINUTES_SEC,
      MINUTES_SEC,
    );
    const strongMemoryHours = MAX_ZOOM_RATIO - Math.trunc(zoom) + 1;
    const epochDiff = end - start;

    // convert epoch diff to second.
    const memoryCount = useMemo(
      () => Math.trunc(epochDiff / EPOCH_SEC / memoryInterval),
      [epochDiff, memoryInterval],
    );

    const startDate = useMemo(() => new Date(start), [start]);
    const hoursCount = Math.trunc(HOURS_SECS / memoryInterval);
    // Convert memory count to pixel.
    const currentPosition = useMemo(() => {
      const diff = Math.min((currentTime - start) / EPOCH_SEC / memoryInterval, memoryCount);
      const strongMemoryCount = diff / (hoursCount * strongMemoryHours);
      return Math.max(
        diff * gapHorizontal +
          (diff - strongMemoryCount) * NORMAL_MEMORY_WIDTH +
          strongMemoryCount * STRONG_MEMORY_WIDTH +
          STRONG_MEMORY_WIDTH / 2,
        0,
      );
    }, [
      currentTime,
      start,
      memoryCount,
      hoursCount,
      gapHorizontal,
      memoryInterval,
      strongMemoryHours,
    ]);

    return (
      <Container>
        <MemoryBox {...events}>
          <MemoryContainer style={{ gap: `0 ${gapHorizontal}px` }}>
            <MemoryList
              start={startDate}
              memoryCount={memoryCount}
              hoursCount={hoursCount}
              gapHorizontal={gapHorizontal}
              memoryInterval={memoryInterval}
              strongMemoryHours={strongMemoryHours}
            />
          </MemoryContainer>
          <Icon
            style={{
              left: currentPosition + PADDING_HORIZONTAL - knobSize / 2,
            }}>
            {renderKnob()}
          </Icon>
        </MemoryBox>
      </Container>
    );
  },
  (prev, next) => prev.currentTime === next.currentTime,
);

const MONTH_LABEL_LIST = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

type MemoryListProps = {
  start: Date;
  memoryCount: number;
  hoursCount: number;
  gapHorizontal: number;
  memoryInterval: number;
  strongMemoryHours: number;
};

const MemoryList: React.FC<MemoryListProps> = memo(
  function MemoryListPresenter({
    start,
    memoryCount,
    hoursCount,
    memoryInterval,
    strongMemoryHours,
  }) {
    const strongHours = hoursCount * strongMemoryHours;
    const lastStrongMemoryIdx = strongHours * (memoryCount / strongHours);
    return (
      <>
        {[...Array(memoryCount + 1)].map((_, idx) => {
          const isHour = idx % hoursCount === 0;
          const isStrongMemory = idx % strongHours === 0;
          if (isStrongMemory && idx !== lastStrongMemoryIdx) {
            const d = new Date(start.getTime() + idx * EPOCH_SEC * memoryInterval);
            const year = d.getFullYear();
            const month = MONTH_LABEL_LIST[d.getMonth()];
            const date = `${d.getDate()}`.padStart(2, "0");
            const hour = `${d.getHours()}`.padStart(2, "0");
            const label = `${month} ${date} ${year} ${hour}:00:00.0000`;

            return (
              <LabeledMemory>
                <MemoryLabel>{label}</MemoryLabel>
                <Memory key={`${idx}`} isHour={isHour} isStrongMemory={isStrongMemory} />
              </LabeledMemory>
            );
          }
          return <Memory key={`${idx}`} isHour={isHour} isStrongMemory={isStrongMemory} />;
        })}
      </>
    );
  },
  (prev, next) =>
    prev.memoryCount === next.memoryCount &&
    prev.start === next.start &&
    prev.memoryInterval === next.memoryInterval &&
    prev.strongMemoryHours === next.strongMemoryHours,
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

const MemoryBox = styled.div`
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

const MemoryContainer = styled.div`
  display: flex;
  min-width: 100%;
  height: 30px;
  align-items: flex-end;
  will-change: auto;
  padding-left: ${PADDING_HORIZONTAL}px;
  ::after {
    content: "";
    display: block;
    padding-right: ${PADDING_HORIZONTAL}px;
    height: 1px;
  }
`;

const LabeledMemory = styled.div`
  display: flex;
  align-items: flex-end;
  position: relative;
  height: 100%;
`;

const MemoryLabel = styled(XXSRegular)`
  position: absolute;
  top: 0;
  left: 0;
  color: ${({ theme }) => theme.colors.publish.dark.text.main};
  white-space: nowrap;
`;

const Memory = styled.div<{
  isHour: boolean;
  isStrongMemory: boolean;
}>`
  flex-shrink: 0;
  width: ${({ isStrongMemory }) =>
    isStrongMemory ? `${STRONG_MEMORY_WIDTH}px` : `${NORMAL_MEMORY_WIDTH}px`};
  height: ${({ isHour }) => (isHour && "16px") || "12px"};
  background: ${({ theme }) => theme.colors.publish.dark.text.weak};
`;

export default Timeline;
