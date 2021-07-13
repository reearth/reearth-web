import { useImperativeHandle, Ref, RefObject, useMemo } from "react";
import { Viewer } from "cesium";
import type { CesiumComponentRef } from "resium";

import type { Ref as EngineRef } from "..";
import { getLocationFromScreenXY, flyTo, lookAt, getCamera } from "./common";
import builtinPrimitives from "./builtin";

export default function useEngineRef(
  ref: Ref<EngineRef>,
  cesium: RefObject<CesiumComponentRef<Viewer>>,
): EngineRef {
  const e = useMemo(
    (): EngineRef => ({
      name: "cesium",
      requestRender: () => {
        cesium.current?.cesiumElement?.scene?.requestRender();
      },
      getCamera: () => {
        return getCamera(cesium.current?.cesiumElement);
      },
      getLocationFromScreenXY: (x, y) =>
        getLocationFromScreenXY(cesium.current?.cesiumElement?.scene, x, y),
      flyTo: (camera, options) => {
        flyTo(
          cesium.current?.cesiumElement?.scene?.camera,
          { ...getCamera(cesium.current?.cesiumElement), ...camera },
          options,
        );
      },
      lookAt: (camera, options) => {
        lookAt(
          cesium.current?.cesiumElement?.scene?.camera,
          { ...getCamera(cesium.current?.cesiumElement), ...camera },
          options,
        );
      },
      zoomIn: amount => {
        cesium.current?.cesiumElement?.scene?.camera.zoomIn(amount);
      },
      zoomOut: amount => {
        cesium.current?.cesiumElement?.scene?.camera.zoomOut(amount);
      },
      builtinPrimitives,
    }),
    [cesium],
  );

  useImperativeHandle(ref, () => e, [e]);

  return e;
}
