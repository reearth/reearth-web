import { useState, useEffect, useCallback, useRef } from "react";

import { degreeToRadian, radianToDegree } from "@reearth/components/atoms/Navigator/utils";

import { SceneProperty } from "../../Engine";
import { useContext } from "../../Plugin";

export const useNavigator = ({ sceneProperty }: { sceneProperty: SceneProperty }) => {
  const ctx = useContext();
  const camera = ctx?.reearth.camera;
  const [degree, setDegree] = useState(0);
  const [isOpenedHelp, setIsOpenedHelp] = useState(false);
  const orbitRadianRef = useRef(0);
  const isMovingOrbit = useRef(false);
  const cameraRotateRight = camera?.rotateRight;
  const cameraOrbit = camera?.orbit;
  const cameraOrbitRef = useRef<typeof cameraOrbit>();

  const handleOnRotate = useCallback(
    (deg: number) => {
      const radian = degreeToRadian(deg);
      cameraRotateRight?.(radian);
    },
    [cameraRotateRight],
  );
  const handleOnStartOrbit = useCallback(() => {
    isMovingOrbit.current = true;
  }, []);
  const handleOnEndOrbit = useCallback(() => {
    isMovingOrbit.current = false;
  }, []);
  const handleOnMoveOrbit = useCallback((deg: number) => {
    orbitRadianRef.current = degreeToRadian(deg);
  }, []);
  const handleOnRestoreRotate = useCallback(() => {
    if (sceneProperty.default?.camera) {
      camera?.flyTo(sceneProperty.default.camera, { duration: 1 });
    }
  }, [camera, sceneProperty]);
  const handleOnClickHelp = useCallback(() => {
    setIsOpenedHelp(prev => !prev);
  }, []);

  const handleOnZoomIn = useCallback(() => {
    camera?.zoomIn(2);
  }, [camera]);
  const handleOnZoomOut = useCallback(() => {
    camera?.zoomOut(2);
  }, [camera]);

  const cameraHeading = camera?.position?.heading;
  // Sync cesium camera.
  useEffect(() => {
    if (!cameraHeading) {
      return;
    }
    setDegree(360 - radianToDegree(cameraHeading));
  }, [cameraHeading]);

  useEffect(() => {
    cameraOrbitRef.current = cameraOrbit;
  }, [cameraOrbit]);

  useEffect(() => {
    const handleTick = () => {
      requestAnimationFrame(() => {
        if (!isMovingOrbit.current) {
          return;
        }
        cameraOrbitRef.current?.(orbitRadianRef.current);
      });
    };
    ctx?.reearth.on("tick", handleTick);
    return () => ctx?.reearth.off("tick", handleTick);
  }, [ctx?.reearth]);

  return {
    degree,
    isOpenedHelp, // TODO: This will be used to display help modal.
    events: {
      onRotate: handleOnRotate,
      onStartOrbit: handleOnStartOrbit,
      onEndOrbit: handleOnEndOrbit,
      onMoveOrbit: handleOnMoveOrbit,
      onRestoreRotate: handleOnRestoreRotate,
      onClickHelp: handleOnClickHelp,
      onZoomIn: handleOnZoomIn,
      onZoomOut: handleOnZoomOut,
    },
  };
};
