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
  renderIcon: () => ReactElement;
  iconWidth: number;
}

const EPOCH_SEC = 1000;
const PADDING_HORIZONTAL = 12;
const STRONG_MEMORY_HOURS = 3;
const STRONG_MEMORY_WIDTH = 2;
const NORMAL_MEMORY_WIDTH = 1;
const GAP_HORIZONTAL = 14;
const HOURS_SECS = 3600;
const MEMORY_INTERVAL = 600;

const Timeline: React.FC<Props> = memo(function TimelinePresenter({
  currentTime,
  timelineRange,
  renderIcon,
  iconWidth,
}) {
  const [startRange, endRange] = timelineRange;
  const epochDiff = endRange - startRange;

  // convert epoch diff to second.
  const memoryCount = useMemo(
    () => Math.trunc(epochDiff / EPOCH_SEC / MEMORY_INTERVAL),
    [epochDiff],
  );
  const startRangeDate = useMemo(() => new Date(startRange), [startRange]);
  const hoursCount = Math.trunc(HOURS_SECS / MEMORY_INTERVAL);
  // Convert memory count to pixel.
  const currentPosition = useMemo(() => {
    const diff = Math.min((currentTime - startRange) / EPOCH_SEC / MEMORY_INTERVAL, memoryCount);
    const strongMemoryCount = diff / (hoursCount * STRONG_MEMORY_HOURS);
    return Math.max(
      diff * GAP_HORIZONTAL +
        (diff - strongMemoryCount) * NORMAL_MEMORY_WIDTH +
        strongMemoryCount * STRONG_MEMORY_WIDTH +
        STRONG_MEMORY_WIDTH / 2,
      0,
    );
  }, [currentTime, startRange, memoryCount, hoursCount]);

  return (
    <Container>
      <MemoryBox>
        <MemoryList startRange={startRangeDate} memoryCount={memoryCount} hoursCount={hoursCount} />
        <Icon
          style={{
            left: currentPosition + PADDING_HORIZONTAL - iconWidth / 2,
          }}>
          {renderIcon()}
        </Icon>
      </MemoryBox>
    </Container>
  );
});

const Container = styled.div`
  background: ${({ theme }) => theme.main.lighterBg};
  width: 100%;
  display: flex;
  align-items: center;
  padding: 5px 12px;
  box-sizing: border-box;
`;

const MemoryBox = styled.div`
  border: 1px solid #b5b5b5;
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
    background-color: #aaa;
  }
`;

const Icon = styled.div`
  position: absolute;
  top: 2px;
`;

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
  startRange: Date;
  memoryCount: number;
  hoursCount: number;
};

const MemoryList: FC<MemoryListProps> = memo(
  function MemoryListPresenter({ startRange, memoryCount, hoursCount }) {
    return (
      <MemoryContainer>
        {[...Array(memoryCount + 1)].map((_, idx) => {
          const isHour = idx % hoursCount === 0;
          const isStrongMemory = idx % (hoursCount * STRONG_MEMORY_HOURS) === 0;
          if (isStrongMemory) {
            const d = new Date(startRange.getTime() + idx * EPOCH_SEC * MEMORY_INTERVAL);
            const year = d.getFullYear();
            const month = MONTH_LABEL_LIST[d.getMonth()];
            const date = `${d.getDate()}`.padStart(2, "0");
            const hour = `${d.getHours()}`.padStart(2, "0");
            // TODO: Fix date format
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
      </MemoryContainer>
    );
  },
  (prev, next) => prev.memoryCount === next.memoryCount && prev.startRange === next.startRange,
);

const MemoryContainer = styled.div`
  display: flex;
  gap: 0 ${GAP_HORIZONTAL}px;
  min-width: 100%;
  height: 30px;
  align-items: flex-end;
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

const MemoryLabel = styled.span`
  position: absolute;
  top: 0;
  left: 0;
  color: ${({ theme }) => theme.other.white};
  font-size: 10px;
  white-space: nowrap;
`;

const Memory = styled.div<{
  isHour: boolean;
  isStrongMemory: boolean;
}>`
  flex-shrink: 0;
  width: ${({ isStrongMemory }) =>
    isStrongMemory ? `${STRONG_MEMORY_WIDTH}px` : `${NORMAL_MEMORY_WIDTH}px`};
  height: ${({ isHour, isStrongMemory }) =>
    (isStrongMemory && "15px") || (isHour && "13px") || "10px"};
  background: #f5f5f5;
`;

export default Timeline;
