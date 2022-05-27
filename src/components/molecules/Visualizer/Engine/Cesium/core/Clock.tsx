import { ClockRange, ClockStep, JulianDate } from "cesium";
import React, { useEffect, useMemo } from "react";
import { Clock, useCesium } from "resium";

import type { SceneProperty } from "../../ref";

export type Props = {
  property?: SceneProperty;
};

export default function ReearthClock({ property }: Props): JSX.Element | null {
  const { animation, visible, start, end, current, stepType, rangeType, multiplier, step } =
    property?.timeline ?? {};
  const startTime = useMemo(() => (start ? JulianDate.fromIso8601(start) : undefined), [start]);
  const stopTime = useMemo(() => (end ? JulianDate.fromIso8601(end) : undefined), [end]);
  const currentTime = useMemo(
    () => (current ? JulianDate.fromIso8601(current) : undefined),
    [current],
  );
  const clockStep =
    stepType === "fixed" ? ClockStep.TICK_DEPENDENT : ClockStep.SYSTEM_CLOCK_MULTIPLIER;
  const clockMultiplier = stepType === "fixed" ? step ?? 1 : multiplier ?? 1;

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
    />
  );
}

const rangeTypes = {
  unbounded: ClockRange.UNBOUNDED,
  clamped: ClockRange.CLAMPED,
  bounced: ClockRange.LOOP_STOP,
};
