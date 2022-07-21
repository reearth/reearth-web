import React, {
  ChangeEventHandler,
  MouseEvent,
  MouseEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  WheelEventHandler,
} from "react";

import {
  BORDER_WIDTH,
  DAY_SECS,
  EPOCH_SEC,
  SCALE_ZOOM_INTERVAL,
  GAP_HORIZONTAL,
  MAX_ZOOM_RATIO,
  PADDING_HORIZONTAL,
  SCALE_INTERVAL,
  MINUTES_SEC,
  HOURS_SECS,
  NORMAL_SCALE_WIDTH,
  STRONG_SCALE_WIDTH,
} from "./constants";
import { TimeEventHandler, Range } from "./types";
import { formatDateForTimeline } from "./utils";

const convertPositionToTime = (e: MouseEvent, { start, end }: Range, gapHorizontal: number) => {
  const curTar = e.currentTarget;
  const width = curTar.scrollWidth - (PADDING_HORIZONTAL + BORDER_WIDTH) * 2 - gapHorizontal;
  const rect = curTar.getBoundingClientRect();
  const clientX = e.clientX - rect.x;
  const scrollX = curTar.scrollLeft;
  const posX = clientX + scrollX - (PADDING_HORIZONTAL + BORDER_WIDTH);
  const percent = posX / width;
  const rangeDiff = end - start;
  const sec = rangeDiff * percent;
  return Math.min(Math.max(start, start + sec), end);
};

type InteractionOption = {
  range: Range;
  gapHorizontal: number;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  onClick?: TimeEventHandler;
  onDrag?: TimeEventHandler;
};

const useTimelineInteraction = ({
  range: { start, end },
  gapHorizontal,
  zoom,
  setZoom,
  onClick,
  onDrag,
}: InteractionOption) => {
  const [isMouseDown, setIsMouseDown] = useState(false);
  const handleOnMouseDown = useCallback(() => {
    setIsMouseDown(true);
  }, []);
  const handleOnMouseUp = useCallback(() => {
    setIsMouseDown(false);
  }, []);
  const handleOnMouseMove: MouseEventHandler = useCallback(
    e => {
      if (!isMouseDown || !onDrag || !e.target) {
        return;
      }

      onDrag(convertPositionToTime(e, { start, end }, gapHorizontal));

      const scrollThreshold = 30;
      const scrollAmount = 20;
      const clientX = e.clientX;
      const curTar = e.currentTarget;
      const clientWidth = curTar.clientWidth;

      if (clientX > clientWidth - scrollThreshold) {
        curTar.scroll(curTar.scrollLeft + scrollAmount, 0);
      }
      if (clientX < scrollThreshold) {
        curTar.scroll(curTar.scrollLeft - scrollAmount, 0);
      }
    },
    [onDrag, start, end, isMouseDown, gapHorizontal],
  );

  useEffect(() => {
    window.addEventListener("mouseup", handleOnMouseUp, { passive: true });
    return () => {
      window.removeEventListener("mouseup", handleOnMouseUp);
    };
  }, [handleOnMouseUp]);

  const handleOnClick: MouseEventHandler = useCallback(
    e => {
      if (!onClick) return;
      onClick(convertPositionToTime(e, { start, end }, gapHorizontal));
    },
    [onClick, end, start, gapHorizontal],
  );

  const handleOnWheel: WheelEventHandler = useCallback(
    e => {
      const { deltaX, deltaY } = e;
      const isHorizontal = Math.abs(deltaX) > 0 || Math.abs(deltaX) < 0;
      if (isHorizontal) return;

      setZoom(() => Math.min(Math.max(1, zoom + deltaY * -0.01), MAX_ZOOM_RATIO));
    },
    [zoom, setZoom],
  );

  return {
    onMouseDown: handleOnMouseDown,
    onMouseMove: handleOnMouseMove,
    onClick: handleOnClick,
    onWheel: handleOnWheel,
  };
};

const DEFAULT_INTERVAL = 10;

type TimelinePlayerOptions = {
  currentTime: number;
  onPlay?: TimeEventHandler;
  range: Range;
};

const useTimelinePlayer = ({ currentTime, onPlay, range }: TimelinePlayerOptions) => {
  const [playSpeed, setPlaySpeed] = useState(1.0);
  const [isPlayed, setIsPlayed] = useState(false);
  const [isPlayBacked, setIsPlayBacked] = useState(false);
  const syncCurrentTimeRef = useRef(currentTime);
  const playTimerRef = useRef<NodeJS.Timer | null>(null);
  const onPlaySpeedChange: ChangeEventHandler<HTMLInputElement> = useCallback(e => {
    setPlaySpeed(parseInt(e.currentTarget.value, 10) / 10);
  }, []);
  const toggleIsPlayed = useCallback(() => {
    if (isPlayBacked) {
      setIsPlayBacked(false);
    }
    setIsPlayed(p => !p);
  }, [isPlayBacked]);
  const toggleIsPlayBacked = useCallback(() => {
    if (isPlayed) {
      setIsPlayed(false);
    }
    setIsPlayBacked(p => !p);
  }, [isPlayed]);
  const formattedCurrentTime = useMemo(() => {
    const textDate = formatDateForTimeline(currentTime, { detail: true });
    const lastIdx = textDate.lastIndexOf(" ");
    const date = textDate.slice(0, lastIdx);
    const time = textDate.slice(lastIdx);
    return `${date}\n${time}`;
  }, [currentTime]);

  useEffect(() => {
    syncCurrentTimeRef.current = currentTime;
  }, [currentTime]);

  useEffect(() => {
    const clearPlayTimer = () => {
      if (playTimerRef.current) {
        clearInterval(playTimerRef.current);
      }
    };

    if ((!isPlayed && !isPlayBacked) || !onPlay) {
      return clearPlayTimer;
    }

    playTimerRef.current = setInterval(() => {
      const interval = EPOCH_SEC * playSpeed;
      if (isPlayed) {
        onPlay(Math.min(syncCurrentTimeRef.current + interval, range.end));
        window.scroll(window.scrollX + playSpeed, 0);
      }
      if (isPlayBacked) {
        onPlay(Math.max(syncCurrentTimeRef.current - interval, range.start));
        window.scroll(window.scrollX - playSpeed, 0);
      }
    }, DEFAULT_INTERVAL);

    return clearPlayTimer;
  }, [playSpeed, onPlay, isPlayed, isPlayBacked, range]);

  return {
    playSpeed,
    onPlaySpeedChange,
    formattedCurrentTime,
    isPlayed,
    isPlayBacked,
    toggleIsPlayed,
    toggleIsPlayBacked,
  };
};

const truncDate = (time: number) => {
  const date = new Date(time);
  date.setMinutes(0);
  date.setSeconds(0, 0);
  return date.getTime();
};

const getRange = (range?: { [K in keyof Range]?: Range[K] }): Range => {
  const { start, end } = range || {};
  if (start !== undefined && end !== undefined) {
    return { start, end };
  }

  if (start !== undefined && end === undefined) {
    return {
      start,
      end: start + DAY_SECS * EPOCH_SEC,
    };
  }

  if (start === undefined && end !== undefined) {
    return {
      start: Math.max(end - DAY_SECS * EPOCH_SEC, 0),
      end,
    };
  }

  const defaultStart = Date.now();

  return {
    start: defaultStart,
    end: defaultStart + DAY_SECS * EPOCH_SEC,
  };
};

type Option = {
  currentTime: number;
  range?: { [K in keyof Range]?: Range[K] };
  onClick?: TimeEventHandler;
  onDrag?: TimeEventHandler;
  onPlay?: TimeEventHandler;
};

export const useTimeline = ({ currentTime, range: _range, onClick, onDrag, onPlay }: Option) => {
  const [zoom, setZoom] = useState(1);
  const range = useMemo(() => {
    const range = getRange(_range);
    if (process.env.NODE_ENV !== "production") {
      if (range.start > range.end) {
        throw new Error("Out of range error. `range.start` should be less than `range.end`");
      }
    }
    return { start: truncDate(range.start), end: truncDate(range.end) };
  }, [_range]);
  const { start, end } = range;
  const startDate = useMemo(() => new Date(start), [start]);
  const gapHorizontal = GAP_HORIZONTAL * (zoom - Math.trunc(zoom) + 1);
  const scaleInterval = Math.max(
    SCALE_INTERVAL - Math.trunc(zoom - 1) * SCALE_ZOOM_INTERVAL * MINUTES_SEC,
    MINUTES_SEC,
  );
  const strongScaleHours = Math.max(MAX_ZOOM_RATIO - Math.trunc(zoom) + 1, 1);
  const epochDiff = end - start;

  // convert epoch diff to minutes.
  const scaleCount = Math.trunc(epochDiff / EPOCH_SEC / scaleInterval);

  // convert HOURS_SECS to minutes.
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
  }, [currentTime, start, scaleCount, hoursCount, gapHorizontal, scaleInterval, strongScaleHours]);

  const events = useTimelineInteraction({ range, zoom, setZoom, gapHorizontal, onClick, onDrag });
  const player = useTimelinePlayer({ currentTime, onPlay, range });

  return {
    startDate,
    scaleCount,
    hoursCount,
    gapHorizontal,
    scaleInterval,
    strongScaleHours,
    currentPosition,
    events,
    player,
  };
};
