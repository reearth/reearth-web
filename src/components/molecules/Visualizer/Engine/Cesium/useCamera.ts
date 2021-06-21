import { useEffect, useRef } from "react";
import type { Viewer } from "cesium";
import { isEqual } from "lodash-es";

import type { Camera } from "@reearth/util/value";
import { getCamera, flyTo } from "./common";

export default function useCamera({
  camera,
  initialCamera,
  viewer,
  onCameraChange,
}: {
  camera?: Camera;
  initialCamera?: Camera;
  viewer?: Viewer;
  onCameraChange?: (camera: Camera) => void;
}) {
  const cesiumCamera = viewer?.camera;
  const prevDest = useRef<Camera>();

  // move to initial position at startup
  useEffect(() => {
    if (!cesiumCamera || !initialCamera) return;

    flyTo(cesiumCamera, initialCamera, { duration: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cesiumCamera]); // ignore initialCamera

  // move camera when camera is changed
  useEffect(() => {
    if (isEqual(prevDest.current, camera)) return;

    flyTo(cesiumCamera, camera, { duration: 0 });
    prevDest.current = camera;
  }, [camera, onCameraChange, cesiumCamera]);

  // call onCameraChange event after moving camera
  useEffect(() => {
    if (!viewer || !onCameraChange) return;

    const callback = () => {
      const c = getCamera(viewer);
      if (c) {
        onCameraChange(c);
      }
    };

    viewer.camera.moveEnd.addEventListener(callback);
    return () => {
      if (viewer.isDestroyed()) return;
      viewer.camera.moveEnd.removeEventListener(callback);
    };
  }, [onCameraChange, viewer]);
}
