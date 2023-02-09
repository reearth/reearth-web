import { useState, useCallback, useEffect, useRef } from "react";

import type { TimeEventHandler } from "@reearth/components/atoms/Timeline";
import { TickEvent, TickEventCallback } from "@reearth/core/Map";

import type { Clock } from "../types";

const getOrNewDate = (d?: Date) => d ?? new Date();
const makeRange = (startTime?: number, stopTime?: number) => {
  return {
    start: startTime,
    end: (startTime || 0) < (stopTime || 0) ? stopTime : undefined,
  };
};

const DEFAULT_SPEED = 1;

export const useTimeline = ({
  clock,
  onPlay,
  onPause,
  onTimeChange,
  onSpeedChange,
  onTick,
  removeTickEventListener,
}: {
  clock?: Clock;
  onPlay?: () => void;
  onPause?: () => void;
  onSpeedChange?: (speed: number) => void;
  onTimeChange?: (time: Date) => void;
  onTick?: TickEvent;
  removeTickEventListener?: TickEvent;
}) => {
  const [range, setRange] = useState(() =>
    makeRange(clock?.start?.getTime(), clock?.stop?.getTime()),
  );
  const [isOpened, setIsOpened] = useState(true);
  const [currentTime, setCurrentTime] = useState(() => getOrNewDate(clock?.current).getTime());
  const isClockInitialized = useRef(false);
  const clockStartTime = clock?.start?.getTime();
  const clockStopTime = clock?.stop?.getTime();
  const clockSpeed = clock?.speed || DEFAULT_SPEED;

  const [speed, setSpeed] = useState(clockSpeed);

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
      const t = new Date(currentTime);
      onTimeChange?.(t);
      setCurrentTime(currentTime);
    },
    [clock, onTimeChange],
  );

  const handleOnPlay = useCallback(
    (playing: boolean) => {
      if (!clock) {
        return;
      }

      // Stop cesium animation
      if (playing) {
        onPlay?.();
      } else {
        onPause?.();
      }
      onSpeedChange?.(Math.abs(speed));
    },
    [clock, onPause, onPlay, onSpeedChange, speed],
  );

  const handleOnPlayReversed = useCallback(
    (playing: boolean) => {
      if (!clock) {
        return;
      }

      // Stop cesium animation
      if (playing) {
        onPlay?.();
      } else {
        onPause?.();
      }
      onSpeedChange?.(Math.abs(speed) * -1);
    },
    [clock, onPause, onPlay, onSpeedChange, speed],
  );

  const handleOnSpeedChange = useCallback(
    (speed: number) => {
      setSpeed(speed);
      if (clock) {
        const absSpeed = Math.abs(speed);
        // Maybe we need to throttle changing speed.
        onSpeedChange?.((clock.speed ?? 1) > 0 ? absSpeed : absSpeed * -1);
      }
    },
    [clock, onSpeedChange],
  );

  // Initialize clock value
  useEffect(() => {
    if (clock && !isClockInitialized.current) {
      isClockInitialized.current = true;
      queueMicrotask(() => {
        onSpeedChange?.(1);
      });
    }
  }, [clock, onSpeedChange, onTick]);

  // Sync cesium clock.
  useEffect(() => {
    setRange(prev => {
      const next = makeRange(clock?.start?.getTime(), clock?.stop?.getTime());
      if (prev.start !== next.start || prev.end !== next.end) {
        return next;
      }
      return prev;
    });
    setSpeed(Math.abs(clockSpeed));
  }, [clockStartTime, clockStopTime, clockSpeed, clock?.start, clock?.stop]);

  useEffect(() => {
    const h: TickEventCallback = d => {
      if (!clock?.playing) return;
      setCurrentTime(d.getTime() || Date.now());
    };
    onTick?.(h);
    return () => {
      removeTickEventListener?.(h);
    };
  }, [onTick, clock?.playing, removeTickEventListener]);

  return {
    speed,
    range,
    isOpened,
    currentTime,
    events: {
      onOpen: handleOnOpen,
      onClose: handleOnClose,
      onClick: handleTimeEvent,
      onDrag: handleTimeEvent,
      onPlay: handleOnPlay,
      onPlayReversed: handleOnPlayReversed,
      onSpeedChange: handleOnSpeedChange,
    },
  };
};
