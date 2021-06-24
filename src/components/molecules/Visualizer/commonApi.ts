import { useMemo } from "react";

import type { Camera, LatLngHeight } from "@reearth/util/value";
import type { Primitive } from ".";
import type { Ref as EngineRef } from "./Engine";

export type CommonAPI = {
  primitives?: Primitive[];
  camera?: Camera;
  selectPrimitive: (layerId?: string, reason?: string) => void;
  getPrimitives: (layerIds: string[]) => (Primitive | undefined)[] | undefined;
  getPrimitive: (layerId: string) => Primitive | undefined;
  requestRender: () => void;
  getLocationFromScreenXY: (x: number, y: number) => LatLngHeight | undefined;
  flyTo: (camera: FlyToCamera, options?: FlyToOptions) => void;
};

export type FlyToCamera = {
  lat?: number;
  lng?: number;
  height?: number;
  pitch?: number;
  heading?: number;
  roll?: number;
  range?: number;
  fov?: number;
};

export type FlyToOptions = { duration?: number; easing?: (time: number) => number };

export default function useCommonAPI({
  engineRef,
  primitives,
  camera,
  onPrimitiveSelect,
}: {
  engineRef?: React.RefObject<EngineRef>;
  primitives?: Primitive[];
  camera?: Camera;
  onPrimitiveSelect?: (id?: string, reason?: string) => void;
}): CommonAPI {
  return useMemo<CommonAPI>(
    () => ({
      primitives,
      camera,
      selectPrimitive: (id, reason) =>
        reason ? onPrimitiveSelect?.(id, reason) : onPrimitiveSelect?.(id),
      getPrimitives: layerIds => {
        if (!primitives) return undefined;
        return layerIds.map(l => primitives.find(m => l === m.id));
      },
      getPrimitive: id => primitives?.find(l => l.id === id),
      getLocationFromScreenXY: (x, y) => engineRef?.current?.getLocationFromScreenXY(x, y),
      requestRender: () => {
        engineRef?.current?.requestRender();
      },
      flyTo: (camera, options) => {
        engineRef?.current?.flyTo?.(camera, options);
      },
    }),
    [primitives, camera, onPrimitiveSelect, engineRef],
  );
}
