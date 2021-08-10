import { useCallback, useEffect, useState } from "react";
import { Widget as WidgetType } from "../Widget";

export type Location = {
  zone?: string;
  section?: string;
  area?: string;
};

export type Alignments = "start" | "centered" | "end";

export type WidgetArea = {
  position: "top" | "middle" | "bottom";
  align?: Alignments;
  widgets?: (Widget | undefined)[];
};

export type WidgetSection = WidgetArea[] | [];

export type WidgetZone = {
  left: WidgetSection;
  center: WidgetSection;
  right: WidgetSection;
};

export type WidgetAlignSystem = {
  outer: WidgetZone;
  inner: WidgetZone;
};

export type Widget = WidgetType & {
  pluginProperty?: any;
};

export type WidgetLayout = {
  extended?: boolean;
  layout?: Location;
  index?: number;
  align?: string;
};

export default function ({
  alignSystem,
  onWidgetUpdate,
}: {
  alignSystem: WidgetAlignSystem;
  onWidgetUpdate?: (
    id: string,
    extended?: boolean | undefined,
    index?: number | undefined,
    align?: Alignments | undefined,
    location?: Location,
  ) => Promise<void>;
}) {
  const [alignState, setAlignState] = useState(alignSystem);

  // Reorder
  const onReorder = useCallback(
    (location?: Location, currentIndex?: number, hoverIndex?: number) => {
      console.log("reorder");
      console.log(location, "location");
      console.log(currentIndex, "currentIndex");
      console.log(hoverIndex, "hoverIndex");
      if (!location?.zone || !location.section || !location.area || !hoverIndex) return;
      const ts = Object.keys(alignSystem);
      console.log(ts, "ts");
      // const wid = alignSystem;
      // onWidgetUpdate?.(wid, undefined, hoverIndex, undefined);
    },
    [alignSystem],
  );

  useEffect(() => {
    setAlignState(alignSystem);
  }, [alignSystem]);

  // Move
  const onMove = useCallback(
    (currentItem?: string, dropLocation?: Location, originalLocation?: Location) => {
      if (
        !currentItem ||
        !dropLocation?.zone ||
        !dropLocation.section ||
        !dropLocation.area ||
        !onWidgetUpdate ||
        (dropLocation.zone == originalLocation?.zone &&
          dropLocation.section == originalLocation.section &&
          dropLocation.area == originalLocation.area)
      )
        return;

      onWidgetUpdate(currentItem, undefined, undefined, undefined, dropLocation);
    },
    [onWidgetUpdate],
  );

  const onAlignChange = useCallback(
    (currentItem?: string, align?: Alignments) => {
      if (!currentItem || !align || !onWidgetUpdate) return;
      onWidgetUpdate(currentItem, undefined, undefined, align, undefined);
    },
    [onWidgetUpdate],
  );

  return {
    alignState,
    onReorder,
    onMove,
    onAlignChange,
  };
}
