import { useState, useCallback, useEffect } from "react";

import { TimeEventHandler } from "@reearth/components/atoms/Timeline/types";

import { Clock } from "../../Engine/ref";
import { useContext } from "../../Plugin";

const getOrNewDate = (d?: Date) => d ?? new Date();
const makeRange = (startTime?: number, stopTime?: number) => {
  return {
    start: startTime,
    end: (startTime || 0) < (stopTime || 0) ? stopTime : undefined,
  };
};

export const useTimeline = () => {
  const ctx = useContext();
  const clock = ctx?.reearth.visualizer.clock;
  const [range, setRange] = useState(() =>
    makeRange(clock?.startTime.getTime(), clock?.stopTime.getTime()),
  );
  const [isOpened, setIsOpened] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => getOrNewDate(clock?.currentTime).getTime());
  const clockCurrentTime = clock?.currentTime.getTime();
  const clockStartTime = clock?.startTime.getTime();
  const clockStopTime = clock?.stopTime.getTime();

  const handleOnOpen = useCallback(() => {
    setIsOpened(true);
  }, []);
  const handleOnClose = useCallback(() => {
    setIsOpened(false);
  }, []);

  const handleTimeEvent: TimeEventHandler = useCallback(
    currentTime => {
      if (!clock) {
        return;
      }
      clock.currentTime = new Date(currentTime);
      setCurrentTime(getOrNewDate(clock.tick()).getTime());
    },
    [clock],
  );

  const handleOnPlay: TimeEventHandler = useCallback(
    currentTime => {
      if (!clock) {
        return;
      }

      // Stop cesium animation
      clock.shouldAnimate = false;
      clock.tick();

      handleTimeEvent(currentTime);
    },
    [handleTimeEvent, clock],
  );

  // Sync cesium clock.
  useEffect(() => {
    const removeHandler = clock?.onTick.addEventListener((nextClock: Clock) => {
      requestAnimationFrame(() => {
        setCurrentTime(getOrNewDate(nextClock?.currentTime).getTime());
        setRange(prev => {
          const next = makeRange(nextClock?.startTime.getTime(), nextClock?.stopTime.getTime());
          if (prev.start !== next.start || prev.end !== next.end) {
            return next;
          }
          return prev;
        });
      });
    });
    return () => removeHandler && clock?.onTick.removeEventListener(removeHandler);
  }, []);

  // Sync cesium clock.
  useEffect(() => {
    setCurrentTime(clockCurrentTime || Date.now());
    setRange(makeRange(clockStartTime, clockStopTime));
  }, [clockCurrentTime, clockStartTime, clockStopTime]);

  return {
    range,
    isOpened,
    currentTime,
    events: {
      onOpen: handleOnOpen,
      onClose: handleOnClose,
      onClick: handleTimeEvent,
      onDrag: handleTimeEvent,
      onPlay: handleOnPlay,
    },
  };
};
