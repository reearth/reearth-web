import * as Cesium from "cesium";
import { Math as CesiumMath } from "cesium";
import { useImperativeHandle, Ref, RefObject, useMemo, useRef } from "react";
import type { CesiumComponentRef } from "resium";

import type { Ref as EngineRef } from "..";
import type { MouseEvents, MouseEvent, Clock } from "../ref";

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
      getClock: () => {
        const viewer = cesium.current?.cesiumElement;
        if (!viewer || viewer.isDestroyed() || !viewer.clock) return;
        const clock: Cesium.Clock = viewer.clock;
        const nextClock: Clock = {
          startTime: Cesium.JulianDate.toDate(clock.startTime),
          stopTime: Cesium.JulianDate.toDate(clock.stopTime),
          currentTime: Cesium.JulianDate.toDate(clock.currentTime),
          tick: () => Cesium.JulianDate.toDate(clock.tick()),
          shouldAnimate: clock.shouldAnimate,
          onTick: {
            addEventListener: cb => {
              const handleOnTick = (c: Cesium.Clock) => {
                const nextClock: Clock = {
                  startTime: Cesium.JulianDate.toDate(c.startTime),
                  stopTime: Cesium.JulianDate.toDate(c.stopTime),
                  currentTime: Cesium.JulianDate.toDate(c.currentTime),
                  tick: () => Cesium.JulianDate.toDate(c.tick()),
                  shouldAnimate: c.shouldAnimate,
                  onTick: {
                    addEventListener: () => () => {},
                    removeEventListener: () => {},
                  },
                };
                cb(nextClock);
              };
              return clock.onTick.addEventListener(handleOnTick);
            },
            removeEventListener: cb => clock.onTick.removeEventListener(cb),
          },
        };
        return new Proxy(nextClock, {
          get: (target, prop: keyof Clock) => target[prop],
          set: (_, prop: keyof Clock, val) => {
            // Sync with cesium value.
            const cesiumVal = val instanceof Date ? Cesium.JulianDate.fromDate(val) : val;
            clock[prop] = cesiumVal;
            return true;
          },
        });
      },
      onClick: (cb: ((props: MouseEvent) => void) | undefined) => {
        mouseEventCallbacks.current.click = cb;
      },
      onDoubleClick: (cb: ((props: MouseEvent) => void) | undefined) => {
        mouseEventCallbacks.current.doubleclick = cb;
      },
      onMouseDown: (cb: ((props: MouseEvent) => void) | undefined) => {
        mouseEventCallbacks.current.mousedown = cb;
      },
      onMouseUp: (cb: ((props: MouseEvent) => void) | undefined) => {
        mouseEventCallbacks.current.mouseup = cb;
      },
      onRightClick: (cb: ((props: MouseEvent) => void) | undefined) => {
        mouseEventCallbacks.current.rightclick = cb;
      },
      onRightDown: (cb: ((props: MouseEvent) => void) | undefined) => {
        mouseEventCallbacks.current.rightdown = cb;
      },
      onRightUp: (cb: ((props: MouseEvent) => void) | undefined) => {
        mouseEventCallbacks.current.rightup = cb;
      },
      onMiddleClick: (cb: ((props: MouseEvent) => void) | undefined) => {
        mouseEventCallbacks.current.middleclick = cb;
      },
      onMiddleDown: (cb: ((props: MouseEvent) => void) | undefined) => {
        mouseEventCallbacks.current.middledown = cb;
      },
      onMiddleUp: (cb: ((props: MouseEvent) => void) | undefined) => {
        mouseEventCallbacks.current.middleup = cb;
      },
      onMouseMove: (cb: ((props: MouseEvent) => void) | undefined) => {
        mouseEventCallbacks.current.mousemove = cb;
      },
      onMouseEnter: (cb: ((props: MouseEvent) => void) | undefined) => {
        mouseEventCallbacks.current.mouseenter = cb;
      },
      onMouseLeave: (cb: ((props: MouseEvent) => void) | undefined) => {
        mouseEventCallbacks.current.mouseleave = cb;
      },
      onWheel: (cb: ((props: MouseEvent) => void) | undefined) => {
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
