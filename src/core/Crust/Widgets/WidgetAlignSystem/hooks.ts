import { useCallback } from "react";

import { getLocationFromId } from "./Area";
import type { Location, Alignment } from "./types";

export default function ({
  onWidgetUpdate,
  onWidgetAlignSystemUpdate,
}: {
  onWidgetUpdate?: (
    id: string,
    update: { location?: Location; extended?: boolean; index?: number },
  ) => void;
  onWidgetAlignSystemUpdate?: (location: Location, align: Alignment) => void;
}) {
  const handleMove = useCallback(
    (id: string, area: string, index: number, prevArea: string, _prevIndex: number) => {
      const location = area !== prevArea ? getLocationFromId(area) : undefined;
      onWidgetUpdate?.(id, { index, location });
    },
    [onWidgetUpdate],
  );

  const handleExtend = useCallback(
    (id: string, extended: boolean) => {
      onWidgetUpdate?.(id, { extended });
    },
    [onWidgetUpdate],
  );

  const handleAlignmentChange = useCallback(
    (id: string, a: Alignment) => {
      const l = getLocationFromId(id);
      if (!l) return;
      onWidgetAlignSystemUpdate?.(l, a);
    },
    [onWidgetAlignSystemUpdate],
  );

  return { handleMove, handleExtend, handleAlignmentChange };
}
