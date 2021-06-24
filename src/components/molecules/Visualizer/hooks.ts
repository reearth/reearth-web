import { useRef, useEffect, useMemo, useState, useCallback } from "react";
import { useDrop, DropOptions } from "@reearth/util/use-dnd";

import type { Ref as EngineRef } from "./Engine";
import type { Primitive } from ".";
import useCommonAPI from "./commonApi";

export default ({
  rootLayerId,
  dropEnabled,
  primitives,
  selectedPrimitiveId: outerSelectedPrimitiveId,
  onPrimitiveSelect,
}: {
  rootLayerId?: string;
  dropEnabled?: boolean;
  primitives?: Primitive[];
  selectedPrimitiveId?: string;
  onPrimitiveSelect?: (id?: string) => void;
}) => {
  const engineRef = useRef<EngineRef>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const { ref: dropRef, isDroppable } = useDrop(
    useMemo(
      (): DropOptions => ({
        accept: ["primitive", "datasetSchema"],
        drop(_item, context) {
          if (!rootLayerId || !dropEnabled) return;
          const loc = context.position
            ? engineRef.current?.getLocationFromScreenXY(context.position.x, context.position.y)
            : undefined;
          return {
            type: "earth",
            layerId: rootLayerId,
            position: loc ? { lat: loc.lat, lng: loc.lng, height: loc.height } : undefined,
          };
        },
        wrapperRef,
      }),
      [rootLayerId, dropEnabled],
    ),
  );
  dropRef(wrapperRef);

  // selection management
  const [selectedPrimitiveId, innerSelectPrimitive] = useState<[id: string, reason?: string]>();
  const selectedPrimitive = useMemo(
    () =>
      selectedPrimitiveId?.[0]
        ? primitives?.find(p => p.id === selectedPrimitiveId?.[0])
        : undefined,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedPrimitiveId?.[0], primitives],
  );
  const selectPrimitive = useCallback(
    (id?: string, reason?: string) => {
      innerSelectPrimitive(s =>
        !id ? undefined : s?.[0] === id && s?.[1] === reason ? s : [id, reason],
      );
      onPrimitiveSelect?.(id);
    },
    [onPrimitiveSelect],
  );
  useEffect(() => {
    if (outerSelectedPrimitiveId) {
      selectPrimitive(outerSelectedPrimitiveId);
    } else {
      selectPrimitive(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outerSelectedPrimitiveId]); // ignore onPrimitiveSelect

  // update cesium
  useEffect(() => {
    engineRef.current?.requestRender();
  });

  const commonAPI = useCommonAPI({
    engineRef,
    primitives,
    onPrimitiveSelect: selectPrimitive,
  });

  return {
    engineRef,
    wrapperRef,
    isDroppable,
    commonAPI,
    selectedPrimitiveId,
    selectedPrimitive,
    selectPrimitive,
  };
};
