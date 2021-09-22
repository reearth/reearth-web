import { useCallback, useEffect, useState } from "react";
import { Widget as WidgetType } from "../Widget";

export type Alignments = "start" | "centered" | "end";

export type Location = {
  zone?: string;
  section?: string;
  area?: string;
};

export type WidgetArea = {
  position: string;
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
  onWidgetAlignSystemUpdate,
}: {
  alignSystem: WidgetAlignSystem;
  onWidgetUpdate?: (
    id: string,
    location?: Location,
    extended?: boolean,
    index?: number,
  ) => Promise<void>;
  onWidgetAlignSystemUpdate?: (location?: Location, align?: Alignments) => Promise<void>;
}) {
  const [alignState, setAlignState] = useState(alignSystem);

  useEffect(() => {
    setAlignState(alignSystem);
  }, [alignSystem]);

  const onReorder = useCallback(
    (id?: string, hoverIndex?: number) => {
      if (!id) return;
      onWidgetUpdate?.(id, undefined, undefined, hoverIndex);
    },
    [onWidgetUpdate],
  );

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

      onWidgetUpdate?.(currentItem, dropLocation, undefined, undefined);
    },
    [onWidgetUpdate],
  );

  const onAlignChange = useCallback(
    (location?: Location, align?: Alignments) => {
      if (!location?.zone || !location.section || !location.area || !align) return;
      onWidgetAlignSystemUpdate?.(location, align);
    },
    [onWidgetAlignSystemUpdate],
  );

  const onExtend = useCallback(
    (currentItem?: string, extended?: boolean) => {
      if (!currentItem || !onWidgetUpdate) return;
      onWidgetUpdate(currentItem, undefined, !extended, undefined);
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
