import { useCallback, useEffect, useState } from "react";
import { Widget as WidgetType } from "../Widget";
// Move types
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
  onWidgetUpdate: (
    id: string,
    extended?: boolean | undefined,
    index?: number | undefined,
    align?: Alignments | undefined,
    location?: Location,
  ) => Promise<void>;
}) {
  const [alignState, setAlignState] = useState(alignSystem);

  // Reorder
  const onReorder = useCallback(() => {
    console.log("reorder");
    // Below is to avoid warning on git commit only
    setAlignState(alignSystem);
  }, [alignSystem]);

  useEffect(() => {
    setAlignState(alignSystem);
  }, [alignSystem]);

  // Move
  const onMove = useCallback(
    (currentItem?: string, dropLocation?: Location) => {
      if (!currentItem || !dropLocation?.zone || !dropLocation.section || !dropLocation.area)
        return;

      onWidgetUpdate(currentItem, undefined, undefined, undefined, dropLocation);
    },
    [onWidgetUpdate],
  );

  const onAlignChange = useCallback(
    (currentItem?: string, align?: Alignments) => {
      if (!currentItem || !align) return;
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
