import { padStart } from "lodash";
import { FC, memo, ReactElement, useMemo } from "react";

import { styled } from "@reearth/theme";

export interface Props {
  /**
   * @description
   * This value need to be epoch time.
   */
  currentTime: number;
  /**
   * @description
   * These value need to be epoch time.
   */
  timelineRange: [start: number, end: number];
  /**
   * @description
   * This value need to be in seconds.
   * Default value is 600sec(10min).
   */
  memoryInterval?: number;
  renderIcon: () => ReactElement;
}

const EPOCH_SEC = 1000;
const PADDING_HORIZONTAL = 10;
const STRONG_MEMORY_HOURS = 3;
const STRONG_MEMORY_WIDTH = 2;
const NORMAL_MEMORY_WIDTH = 1;
const GAP_HORIZONTAL = 7;
const HOURS_SECS = 3600;

const Timeline: React.FC<Props> = ({
  currentTime,
  timelineRange,
  memoryInterval = 600,
  renderIcon,
}) => {
  const [startRange, endRange] = timelineRange;
  const epochDiff = endRange - startRange;

  // convert epoch diff to second.
  const memoryCount = useMemo(
    () => Math.trunc(epochDiff / EPOCH_SEC / memoryInterval),
    [epochDiff, memoryInterval],
  );
  const startRangeDate = useMemo(() => new Date(startRange), [startRange]);
  const hoursCount = Math.trunc(HOURS_SECS / memoryInterval);
  // Convert memory count to pixel.
  const currentPosition = useMemo(() => {
    if (currentTime < startRange || currentTime > endRange) {
      return 0;
    }
    const diff = (currentTime - startRange) / EPOCH_SEC / memoryInterval;
    const currentMemoryCount = hoursCount * STRONG_MEMORY_HOURS;
    return (
      (diff * (currentMemoryCount * (GAP_HORIZONTAL + NORMAL_MEMORY_WIDTH) + STRONG_MEMORY_WIDTH)) /
        currentMemoryCount +
      GAP_HORIZONTAL / 2
    );
  }, [currentTime, startRange, hoursCount, endRange, memoryInterval]);

  return (
    <Container>
      <MemoryList
        startRange={startRangeDate}
        memoryCount={memoryCount}
        memoryInterval={memoryInterval}
        hoursCount={hoursCount}
      />
      {/* TODO: Subtract icon width from position left. Currently Icon is displayed left corner as pointer. */}
      <Icon style={{ left: currentPosition + PADDING_HORIZONTAL }}>{renderIcon()}</Icon>
    </Container>
  );
};

const Container = styled.div`
  position: relative;
  background: #303846;
  overflow-x: auto;
`;

const Icon = styled.div`
  position: absolute;
  top: 2px;
`;

type MemoryListProps = {
  startRange: Date;
  memoryCount: number;
  memoryInterval: number;
  hoursCount: number;
};

const MemoryList: FC<MemoryListProps> = memo(
  function MemoryListPresenter({ startRange, memoryCount, memoryInterval, hoursCount }) {
    return (
      <MemoryContainer>
        {[...Array(memoryCount)].map((_, idx) => {
          const isHour = idx % hoursCount === 0;
          const isThreeHours = idx % (hoursCount * STRONG_MEMORY_HOURS) === 0;
          if (isThreeHours) {
            const d = new Date(startRange.getTime() + idx * EPOCH_SEC * memoryInterval);
            const year = d.getFullYear();
            const month = padStart(`${d.getMonth() + 1}`, 2, "0");
            const date = padStart(`${d.getDate()}`, 2, "0");
            const hour = padStart(`${d.getHours()}`, 2, "0");
            // TODO: Fix date format
            const label = `${year}/${month}/${date} ${hour}:00`;

            return (
              <LabeledMemory>
                <MemoryLabel>{label}</MemoryLabel>
                <Memory key={`${idx}`} isHour={isHour} isThreeHours={isThreeHours} />
              </LabeledMemory>
            );
          }
          return <Memory key={`${idx}`} isHour={isHour} isThreeHours={isThreeHours} />;
        })}
      </MemoryContainer>
    );
  },
  (prev, next) => prev.memoryCount === next.memoryCount && prev.startRange === next.startRange,
);

const MemoryContainer = styled.div`
  display: flex;
  gap: 0 ${GAP_HORIZONTAL}px;
  min-width: 100%;
  height: 32px;
  align-items: flex-end;
  padding-left: ${PADDING_HORIZONTAL}px;
  ::after {
    content: "";
    display: block;
    padding-right: ${PADDING_HORIZONTAL}px;
    height: 1px;
  }
`;

type MemoryProps = {
  isHour: boolean;
  isThreeHours: boolean;
};

const LabeledMemory = styled.div`
  display: flex;
  align-items: flex-end;
  position: relative;
  height: 100%;
`;

const MemoryLabel = styled.span`
  position: absolute;
  top: 0;
  left: 0;
  color: #fff;
  font-size: 11px;
  white-space: nowrap;
`;

const Memory = styled.div<MemoryProps>`
  flex-shrink: 0;
  width: ${({ isThreeHours }) =>
    isThreeHours ? `${STRONG_MEMORY_WIDTH}px` : `${NORMAL_MEMORY_WIDTH}px`};
  height: ${({ isHour, isThreeHours }) => (isThreeHours && "15px") || (isHour && "13px") || "10px"};
  background: ${({ isThreeHours }) => (isThreeHours ? "#fff" : "#aaa")};
`;

export default Timeline;
