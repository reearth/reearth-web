import {
  MouseEvent,
  MouseEventHandler,
  useCallback,
  useEffect,
  useState,
  WheelEventHandler,
} from "react";

import { BORDER_WIDTH, GAP_HORIZONTAL, MAX_ZOOM_RATIO, PADDING_HORIZONTAL } from "./constants";
import { TimeEventHandler, Range } from "./types";

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
  return start + sec;
};

type InteractionOption = {
  range: Range;
  onClick?: TimeEventHandler;
  onDrag?: TimeEventHandler;
};

export const useTimelineInteraction = ({
  range: { start, end },
  onClick,
  onDrag,
}: InteractionOption) => {
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [zoom, setZoom] = useState(1);
  const gapHorizontal = GAP_HORIZONTAL * (zoom - Math.trunc(zoom) + 1);
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
      if (!onClick) {
        return;
      }
      onClick(convertPositionToTime(e, { start, end }, gapHorizontal));
    },
    [onClick, end, start, gapHorizontal],
  );

  const handleOnWheel: WheelEventHandler = useCallback(
    e => {
      const { deltaX, deltaY } = e;
      const isHorizontal = Math.abs(deltaX) > 0 || Math.abs(deltaX) < 0;
      if (isHorizontal) {
        return;
      }

      setZoom(() => Math.min(Math.max(1, zoom + deltaY * -0.01), MAX_ZOOM_RATIO));
    },
    [zoom],
  );

  return {
    zoom,
    events: {
      onMouseDown: handleOnMouseDown,
      onMouseMove: handleOnMouseMove,
      onClick: handleOnClick,
      onWheel: handleOnWheel,
    },
  };
};
