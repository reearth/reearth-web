import * as Cesium from "cesium";
import { Math as CesiumMath, Cartesian3, Ellipsoid } from "cesium";
import { useImperativeHandle, Ref, RefObject, useMemo, useRef } from "react";
import type { CesiumComponentRef } from "resium";

import type { Ref as EngineRef } from "..";
import type { MouseEvents, MouseEvent } from "../ref";

import builtinPrimitives from "./builtin";
import Cluster from "./Cluster";
import { getLocationFromScreenXY, flyTo, lookAt, getCamera, getClock } from "./common";

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
        return getClock(clock);
      },
      enableScreenSpaceCameraController: () => {
        const viewer = cesium.current?.cesiumElement;
        if (!viewer || viewer.isDestroyed() || !viewer.scene) return;
        viewer.scene.screenSpaceCameraController.enableRotate = true;
        viewer.scene.screenSpaceCameraController.enableTranslate = true;
        viewer.scene.screenSpaceCameraController.enableZoom = true;
        viewer.scene.screenSpaceCameraController.enableTilt = true;
        viewer.scene.screenSpaceCameraController.enableLook = true;
      },
      disableScreenSpaceCameraController: () => {
        const viewer = cesium.current?.cesiumElement;
        if (!viewer || viewer.isDestroyed() || !viewer.scene) return;
        viewer.scene.screenSpaceCameraController.enableRotate = false;
        viewer.scene.screenSpaceCameraController.enableTranslate = false;
        viewer.scene.screenSpaceCameraController.enableZoom = false;
        viewer.scene.screenSpaceCameraController.enableTilt = false;
        viewer.scene.screenSpaceCameraController.enableLook = false;
      },
      lookUp: amount => {
        const viewer = cesium.current?.cesiumElement;
        if (!viewer || viewer.isDestroyed()) return;
        viewer?.scene?.camera.lookUp(amount);
      },
      lookRight: amount => {
        const viewer = cesium.current?.cesiumElement;
        if (!viewer || viewer.isDestroyed()) return;
        viewer?.scene?.camera.lookRight(amount);
      },
      lookHorizontal: amount => {
        const viewer = cesium.current?.cesiumElement;
        if (!viewer || viewer.isDestroyed()) return;
        const camera = viewer.scene.camera;
        const ellipsoid = viewer.scene.globe.ellipsoid;
        const surfaceNormal = ellipsoid.geodeticSurfaceNormal(camera.position, new Cartesian3());
        camera.look(surfaceNormal, amount);
      },
      lookVertical: amount => {
        const viewer = cesium.current?.cesiumElement;
        if (!viewer || viewer.isDestroyed()) return;
        const camera = viewer.scene.camera;
        const ellipsoid = viewer.scene.globe.ellipsoid;
        // const surfaceNormal = ellipsoid.geodeticSurfaceNormal(camera.position, new Cartesian3());
        const surfaceTangent = projectVectorToSurface(camera.right, camera.position, ellipsoid);
        // const currentAngle = CesiumMath.toDegrees(
        //   Cartesian3.angleBetween(surfaceNormal, camera.up),
        // );
        // const angleAfterLook = rotateVectorAboutAxis(camera.up, surfaceTangent, amount);
        camera.look(surfaceTangent, amount);
      },
      moveForward: amount => {
        const viewer = cesium.current?.cesiumElement;
        if (!viewer || viewer.isDestroyed()) return;
        viewer?.scene?.camera.moveForward(amount);
      },
      moveBackward: amount => {
        const viewer = cesium.current?.cesiumElement;
        if (!viewer || viewer.isDestroyed()) return;
        viewer?.scene?.camera.moveBackward(amount);
      },
      moveUp: amount => {
        const viewer = cesium.current?.cesiumElement;
        if (!viewer || viewer.isDestroyed()) return;
        viewer?.scene?.camera.moveUp(amount);
      },
      moveDown: amount => {
        const viewer = cesium.current?.cesiumElement;
        if (!viewer || viewer.isDestroyed()) return;
        viewer?.scene?.camera.moveDown(amount);
      },
      moveLeft: amount => {
        const viewer = cesium.current?.cesiumElement;
        if (!viewer || viewer.isDestroyed()) return;
        viewer?.scene?.camera.moveLeft(amount);
      },
      moveRight: amount => {
        const viewer = cesium.current?.cesiumElement;
        if (!viewer || viewer.isDestroyed()) return;
        viewer?.scene?.camera.moveRight(amount);
      },
      setView: options => {
        const viewer = cesium.current?.cesiumElement;
        if (!viewer || viewer.isDestroyed()) return;
        viewer?.scene?.camera.setView(options);
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

function projectVectorToSurface(vector: Cartesian3, position: Cartesian3, ellipsoid: Ellipsoid) {
  const surfaceNormal = ellipsoid.geodeticSurfaceNormal(position, new Cartesian3());
  const magnitudeOfProjectionOnSurfaceNormal = Cartesian3.dot(vector, surfaceNormal);
  const projectionOnSurfaceNormal = Cartesian3.multiplyByScalar(
    surfaceNormal,
    magnitudeOfProjectionOnSurfaceNormal,
    new Cartesian3(),
  );
  return Cartesian3.subtract(vector, projectionOnSurfaceNormal, new Cartesian3());
}
