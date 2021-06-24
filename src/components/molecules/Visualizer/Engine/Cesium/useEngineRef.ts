import { useImperativeHandle, Ref, RefObject } from "react";
import { Viewer } from "cesium";
import type { CesiumComponentRef } from "resium";

import type { Ref as EngineRef } from "..";
import { getLocationFromScreenXY, flyTo, getCamera } from "./common";

export default function useEngineRef(
  ref: Ref<EngineRef>,
  cesium: RefObject<CesiumComponentRef<Viewer>>,
) {
  useImperativeHandle(
    ref,
    () => ({
      requestRender: () => {
        cesium.current?.cesiumElement?.scene?.requestRender();
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
    }),
    [cesium],
  );
}
