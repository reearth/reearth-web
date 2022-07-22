import * as Cesium from "cesium";
import { Math as CesiumMath } from "cesium";
import { useImperativeHandle, Ref, RefObject, useMemo, useRef } from "react";
import type { CesiumComponentRef } from "resium";

import type { Ref as EngineRef } from "..";
import type { MouseEvents } from "../ref";

import builtinPrimitives from "./builtin";
import Cluster from "./Cluster";
import { getLocationFromScreenXY, flyTo, lookAt, getCamera } from "./common";

export default function useEngineRef(
  ref: Ref<EngineRef>,
  cesium: RefObject<CesiumComponentRef<Cesium.Viewer>>,
): EngineRef {
  const cancelCameraFlight = useRef<() => void>();
  const mouseEventCallbacks = useRef<MouseEvents>({
    click: undefined,
    doubleclick: undefined,
    mousedown: undefined,
    mouseup: undefined,
    rightclick: undefined,
    rightdown: undefined,
    rightup: undefined,
    middleclick: undefined,
    middledown: undefined,
    middleup: undefined,
    mousemove: undefined,
    mouseenter: undefined,
    mouseleave: undefined,
    pinchstart: undefined,
    pinchend: undefined,
    pinchmove: undefined,
    wheel: undefined,
  });
  const e = useMemo((): EngineRef => {
    return {
      name: "cesium",
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
        cancelCameraFlight.current?.();
        cancelCameraFlight.current = flyTo(
          viewer.scene?.camera,
          { ...getCamera(viewer), ...camera },
          options,
        );
      },
      lookAt: (camera, options) => {
        const viewer = cesium.current?.cesiumElement;
        if (!viewer || viewer.isDestroyed()) return;
        cancelCameraFlight.current?.();
        cancelCameraFlight.current = lookAt(
          viewer.scene?.camera,
          { ...getCamera(viewer), ...camera },
          options,
        );
      },
      getViewport: () => {
        const viewer = cesium.current?.cesiumElement;
        if (!viewer || viewer.isDestroyed()) return;
        const rect = viewer.camera.computeViewRectangle();
        return rect
          ? {
              north: CesiumMath.toDegrees(rect.north),
              south: CesiumMath.toDegrees(rect.south),
              west: CesiumMath.toDegrees(rect.west),
              east: CesiumMath.toDegrees(rect.east),
            }
          : undefined;
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
      changeSceneMode: (sceneMode, duration = 2) => {
        const viewer = cesium.current?.cesiumElement;
        if (!viewer || viewer.isDestroyed() || !viewer.scene) return;
        switch (sceneMode) {
          case "2d":
            viewer?.scene?.morphTo2D(duration);
            break;
          case "columbus":
            viewer?.scene?.morphToColumbusView(duration);
            break;
          case "3d":
          default:
            viewer?.scene?.morphTo3D(duration);
            break;
        }
      },
      onClick: (cb: any) => {
        mouseEventCallbacks.current.click = cb;
      },
      onDoubleClick: (cb: any) => {
        mouseEventCallbacks.current.doubleclick = cb;
      },
      onMouseDown: (cb: any) => {
        mouseEventCallbacks.current.mousedown = cb;
      },
      onMouseUp: (cb: any) => {
        mouseEventCallbacks.current.mouseup = cb;
      },
      onRightClick: (cb: any) => {
        mouseEventCallbacks.current.rightclick = cb;
      },
      onRightDown: (cb: any) => {
        mouseEventCallbacks.current.rightdown = cb;
      },
      onRightUp: (cb: any) => {
        mouseEventCallbacks.current.rightup = cb;
      },
      onMiddleClick: (cb: any) => {
        mouseEventCallbacks.current.middleclick = cb;
      },
      onMiddleDown: (cb: any) => {
        mouseEventCallbacks.current.middledown = cb;
      },
      onMiddleUp: (cb: any) => {
        mouseEventCallbacks.current.middleup = cb;
      },
      onMouseMove: (cb: any) => {
        mouseEventCallbacks.current.mousemove = cb;
      },
      onMouseEnter: (cb: any) => {
        mouseEventCallbacks.current.mouseenter = cb;
      },
      onMouseLeave: (cb: any) => {
        mouseEventCallbacks.current.mouseleave = cb;
      },
      onPinchStart: (cb: any) => {
        mouseEventCallbacks.current.pinchstart = cb;
      },
      onPinchEnd: (cb: any) => {
        mouseEventCallbacks.current.pinchend = cb;
      },
      onPinchMove: (cb: any) => {
        mouseEventCallbacks.current.pinchmove = cb;
      },
      onWheel: (cb: any) => {
        mouseEventCallbacks.current.wheel = cb;
      },
      mouseEventCallbacks: mouseEventCallbacks.current,
      builtinPrimitives,
      clusterComponent: Cluster,
    };
  }, [cesium]);

  useImperativeHandle(ref, () => e, [e]);

  return e;
}
