import { Clock as CesiumClock, ClockRange, ClockStep, JulianDate } from "cesium";
import { useCallback, useEffect, useMemo } from "react";
import { Clock, useCesium } from "resium";

import type { SceneProperty } from "../..";
import { convertTime } from "../common";

export type Props = {
  property?: SceneProperty;
  onTick?: (d: Date) => void;
};

export default function ReearthClock({ property, onTick }: Props): JSX.Element | null {
  const { animation, visible, start, stop, current, stepType, rangeType, multiplier, step } =
    property?.timeline ?? {};
  const startTime = useMemo(() => (start ? convertTime(start) : undefined), [start]);
  const stopTime = useMemo(() => (stop ? convertTime(stop) : undefined), [stop]);
  const currentTime = useMemo(() => (current ? convertTime(current) : undefined), [current]);
  const clockStep =
    stepType === "fixed" ? ClockStep.TICK_DEPENDENT : ClockStep.SYSTEM_CLOCK_MULTIPLIER;
  const clockMultiplier = stepType === "fixed" ? step ?? 1 : multiplier ?? 1;

  const handleTick = useCallback(
    (clock: CesiumClock) => {
      // NOTE: Must not update state. This event will be called every frame.
      onTick?.(JulianDate.toDate(clock.currentTime));
    },
    [onTick],
  );

  const { viewer } = useCesium();
  useEffect(() => {
    if (!viewer) return;
    if (viewer.animation?.container) {
      (viewer.animation.container as HTMLDivElement).style.visibility = visible
        ? "visible"
        : "hidden";
    }
    if (viewer.timeline?.container) {
      (viewer.timeline.container as HTMLDivElement).style.visibility = visible
        ? "visible"
        : "hidden";
    }
    viewer.forceResize();
  }, [viewer, visible]);

  return (
    <Clock
      shouldAnimate={animation}
      startTime={startTime}
      stopTime={stopTime}
      currentTime={currentTime}
      clockStep={clockStep}
      multiplier={clockMultiplier}
      clockRange={rangeType ? rangeTypes[rangeType] : undefined}
      onTick={handleTick}
    />
  );
}

const rangeTypes = {
  unbounded: ClockRange.UNBOUNDED,
  clamped: ClockRange.CLAMPED,
  bounced: ClockRange.LOOP_STOP,
};
