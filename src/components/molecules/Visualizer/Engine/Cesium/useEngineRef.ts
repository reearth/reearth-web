import { Color, Entity, Viewer } from "cesium";
import { useImperativeHandle, Ref, RefObject, useMemo } from "react";
import type { CesiumComponentRef } from "resium";

import type { Ref as EngineRef } from "..";

import builtinPrimitives from "./builtin";
import { getLocationFromScreenXY, flyTo, lookAt, getCamera } from "./common";

const exposed = { Entity, Color };

const cesiumAPI = {
  Cesium: Object.keys(exposed).reduce(
    (a, b) => ({
      ...a,
      get [b]() {
        return exposed[b as keyof typeof exposed];
      },
    }),
    {} as any,
  ),
};

const isMarshalable = (t: any): boolean | "json" => {
  return Object.values({ ...exposed, Viewer }).some(v => t instanceof v);
};

export default function useEngineRef(
  ref: Ref<EngineRef>,
  cesium: RefObject<CesiumComponentRef<Viewer>>,
): EngineRef {
  const e = useMemo(
    (): EngineRef => ({
      name: "cesium",
      pluginApi: {
        ...cesiumAPI,
        reearth: {
          get viewer(): Viewer | undefined {
            return cesium.current?.cesiumElement;
          },
        },
      },
      isMarshalable,
      requestRender: () => {
        const viewer = cesium.current?.cesiumElement;
        if (!viewer || viewer.isDestroyed()) return;
        viewer.scene?.requestRender();
      },
      getCamera: () => {
        const viewer = cesium.current?.cesiumElement;
        if (!viewer || viewer.isDestroyed()) return;
        return getCamera(viewer);
      },
      getLocationFromScreenXY: (x, y) => {
        const viewer = cesium.current?.cesiumElement;
        if (!viewer || viewer.isDestroyed()) return;
        return getLocationFromScreenXY(viewer.scene, x, y);
      },
      flyTo: (camera, options) => {
        const viewer = cesium.current?.cesiumElement;
        if (!viewer || viewer.isDestroyed()) return;
        flyTo(viewer.scene?.camera, { ...getCamera(viewer), ...camera }, options);
      },
      lookAt: (camera, options) => {
        const viewer = cesium.current?.cesiumElement;
        if (!viewer || viewer.isDestroyed()) return;
        lookAt(viewer.scene?.camera, { ...getCamera(viewer), ...camera }, options);
      },
      zoomIn: amount => {
        const viewer = cesium.current?.cesiumElement;
        if (!viewer || viewer.isDestroyed()) return;
        viewer.scene?.camera.zoomIn(amount);
      },
      zoomOut: amount => {
        const viewer = cesium.current?.cesiumElement;
        if (!viewer || viewer.isDestroyed()) return;
        viewer?.scene?.camera.zoomOut(amount);
      },
      builtinPrimitives,
    }),
    [cesium],
  );

  useImperativeHandle(ref, () => e, [e]);

  return e;
}
