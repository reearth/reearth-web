import { useRef, useEffect, useMemo } from "react";
import { useDrop, DropOptions } from "@reearth/util/use-dnd";

import type { Ref as EngineRef } from "./Engine";
import type { Primitive } from ".";
import useCommonAPI from "./commonApi";

export default ({
  rootLayerId,
  dropEnabled,
  primitives,
  onPrimitiveSelect: onLayerSelect,
}: {
  rootLayerId?: string;
  dropEnabled?: boolean;
  primitives?: Primitive[];
  onPrimitiveSelect?: (id?: string, reason?: string) => void;
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

  useEffect(() => {
    engineRef.current?.requestRender();
  });

  const commonAPI = useCommonAPI({
    engineRef,
    primitives,
    onLayerSelect,
  });

  return {
    engineRef,
    wrapperRef,
    isDroppable,
    commonAPI,
  };
};
