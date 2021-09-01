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

export type WidgetSection = WidgetArea[];

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

  useEffect(() => {
    setAlignState(alignSystem);
  }, [alignSystem]);

  // Reorder
  const onReorder = useCallback(
    (id?: string, hoverIndex?: number) => {
      if (!id) return;
      onWidgetUpdate?.(id, undefined, hoverIndex, undefined);
    },
    [onWidgetUpdate],
  );

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

  const onExtend = useCallback(
    (currentItem?: string, extended?: boolean) => {
      if (!currentItem || !onWidgetUpdate) return;
      onWidgetUpdate(currentItem, !extended, undefined, undefined, undefined);
    },
    [onWidgetUpdate],
  );

  return {
    alignState,
    onReorder,
    onMove,
    onAlignChange,
    onExtend,
  };
}
