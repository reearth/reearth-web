import { JulianDate, requestAnimationFrame } from "cesium";
import { useState, useCallback, useEffect } from "react";

import { TimeEventHandler } from "@reearth/components/atoms/Timeline/types";

import { useContext } from "../../Plugin";

const JulianDateToDate = (jd?: JulianDate) => (jd ? JulianDate.toDate(jd) : new Date());
const makeRange = (startTimeJulian?: JulianDate, stopTimeJulian?: JulianDate) => {
  const startTime = JulianDateToDate(startTimeJulian);
  const stopTime = JulianDateToDate(stopTimeJulian);
  return {
    start: startTime.getTime(),
    end: startTime < stopTime ? stopTime.getTime() : Date.now(),
  };
};

export const useTimeline = () => {
  const ctx = useContext();
  const clock = ctx?.reearth.visualizer.clock;
  const [range, setRange] = useState(() => makeRange(clock?.startTime, clock?.stopTime));
  const [isOpened, setIsOpened] = useState(false);
  const [currentTime, setCurrentTime] = useState(() =>
    JulianDateToDate(clock?.currentTime).getTime(),
  );

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
      clock.currentTime = JulianDate.fromDate(new Date(currentTime));
      setCurrentTime(JulianDateToDate(clock.tick()).getTime());
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
    [handleTimeEvent],
  );

  // Sync cesium clock.
  useEffect(() => {
    setCurrentTime(JulianDateToDate(clock?.currentTime).getTime());
    setRange(makeRange(clock?.startTime, clock?.stopTime));
    clock?.onTick.addEventListener(clock => {
      requestAnimationFrame(() => {
        setCurrentTime(JulianDateToDate(clock?.currentTime).getTime());
        setRange(prev => {
          const next = makeRange(clock?.startTime, clock?.stopTime);
          if (prev.start !== next.start || prev.end !== next.end) {
            return next;
          }
          return prev;
        });
      });
    });
  }, [clock]);

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
