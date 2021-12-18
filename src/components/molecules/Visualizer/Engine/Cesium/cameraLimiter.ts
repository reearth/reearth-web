import {
  Cartesian3,
  Cartographic,
  Color,
  EllipsoidGeodesic,
  PolylineDashMaterialProperty,
  Math,
  Camera as CesiumCamera,
  Rectangle,
} from "cesium";
import type { Viewer as CesiumViewer } from "cesium";
import { useEffect, useMemo, useState } from "react";
import { CesiumComponentRef } from "resium";
import { RefObject } from "use-callback-ref/dist/es5/types";

import { Camera } from "@reearth/util/value";

import type { SceneProperty } from "..";

import { getCamera } from "./common";

export function useCameraLimiter(
  cesium: RefObject<CesiumComponentRef<CesiumViewer>>,
  camera: Camera | undefined,
  property: SceneProperty["cameraLimiter"] | undefined,
) {
  const geodsic = useMemo(():
    | undefined
    | { geodesicVertical: EllipsoidGeodesic; geodesicHorizontal: EllipsoidGeodesic } => {
    const viewer = cesium.current?.cesiumElement;
    if (!viewer || viewer.isDestroyed()) return undefined;
    return getGeodsic(viewer, property);
  }, [cesium, property]);

  // calculate inner limiter dimensions
  const targetWidth = 1000000;
  const targetLength = 1000000;
  const limiterDimensions = useMemo((): InnerLimiterDimensions | undefined => {
    const viewer = cesium.current?.cesiumElement;
    if (!viewer || viewer.isDestroyed() || !geodsic) return undefined;
    const {
      cameraLimiterTargetWidth: width = targetWidth,
      cameraLimiterTargetLength: length = targetLength,
    } = property ?? {};

    const { cartesianArray, cartographicDimensions } = calcBoundaryBox(
      geodsic,
      length / 2,
      width / 2,
    );

    return {
      cartographicDimensions,
      cartesianArray,
    };
  }, [cesium, property, geodsic]);

  // calculate maximum camera view (outer boundaries)
  const [cameraViewOuterBoundaries, setCameraViewOuterBoundaries] = useState<
    Cartesian3[] | undefined
  >();

  useEffect(() => {
    const viewer = cesium.current?.cesiumElement;
    if (!viewer || viewer.isDestroyed() || !property?.cameraLimiterTargetArea || !geodsic) return;

    const camera = new CesiumCamera(viewer.scene);
    camera.setView({
      destination: Cartesian3.fromDegrees(
        property.cameraLimiterTargetArea.lng,
        property.cameraLimiterTargetArea.lat,
        property.cameraLimiterTargetArea.height,
      ),
      orientation: {
        heading: property?.cameraLimiterTargetArea.heading,
        pitch: property?.cameraLimiterTargetArea.pitch,
        roll: property?.cameraLimiterTargetArea.roll,
        up: camera.up,
      },
    });

    const computedViewRectangle = camera.computeViewRectangle();
    if (!computedViewRectangle) return;
    const rectangleHalfWidth = Rectangle.computeWidth(computedViewRectangle) * Math.PI * 1000000;
    const rectangleHalfHeight = Rectangle.computeHeight(computedViewRectangle) * Math.PI * 1000000;

    const {
      cameraLimiterTargetWidth: width = targetWidth,
      cameraLimiterTargetLength: length = targetLength,
    } = property ?? {};

    const { cartesianArray } = calcBoundaryBox(
      geodsic,
      length / 2 + rectangleHalfHeight,
      width / 2 + rectangleHalfWidth,
    );

    setCameraViewOuterBoundaries(cartesianArray);
  }, [cesium, property, geodsic]);

  // Manage camera limiter conditions
  useEffect(() => {
    console.log("why");

    const camera = getCamera(cesium?.current?.cesiumElement);
    const viewer = cesium?.current?.cesiumElement;
    if (!viewer || viewer.isDestroyed() || !property?.cameraLimiterEnabled || !limiterDimensions)
      return;
    if (camera) {
      viewer.camera.setView({
        destination: getAllowedCameraDestination(camera, limiterDimensions),
        orientation: {
          heading: viewer.camera.heading,
          pitch: viewer.camera.pitch,
          roll: viewer.camera.roll,
          up: viewer.camera.up,
        },
      });
    }
  }, [camera, cesium, property, limiterDimensions]);

  return {
    limiterDimensions,
    cameraViewOuterBoundaries,
    cameraViewBoundariesMaterial,
  };
}

export const cameraViewBoundariesMaterial = new PolylineDashMaterialProperty({
  color: Color.RED,
});

export type InnerLimiterDimensions = {
  cartographicDimensions: {
    rightDemention: Cartographic;
    leftDemention: Cartographic;
    topDemention: Cartographic;
    bottomDemention: Cartographic;
  };
  cartesianArray: Cartesian3[];
};

export const getGeodsic = (
  viewer: CesiumViewer,
  property: SceneProperty["cameraLimiter"] | undefined,
): { geodesicVertical: EllipsoidGeodesic; geodesicHorizontal: EllipsoidGeodesic } | undefined => {
  if (!property || !property?.cameraLimiterTargetArea) return undefined;
  const ellipsoid = viewer.scene.globe.ellipsoid;

  const centerPoint = Cartesian3.fromDegrees(
    property.cameraLimiterTargetArea.lng,
    property.cameraLimiterTargetArea.lat,
    0,
  );

  const cartographicCenterPoint = Cartographic.fromCartesian(centerPoint);
  const normal = ellipsoid.geodeticSurfaceNormal(centerPoint);
  const east = Cartesian3.normalize(
    Cartesian3.cross(Cartesian3.UNIT_Z, normal, new Cartesian3()),
    new Cartesian3(),
  );
  const north = Cartesian3.normalize(
    Cartesian3.cross(normal, east, new Cartesian3()),
    new Cartesian3(),
  );

  const geodesicVertical = new EllipsoidGeodesic(
    cartographicCenterPoint,
    Cartographic.fromCartesian(north),
    ellipsoid,
  );
  const geodesicHorizontal = new EllipsoidGeodesic(
    cartographicCenterPoint,
    Cartographic.fromCartesian(east),
    ellipsoid,
  );
  return { geodesicVertical, geodesicHorizontal };
};

export const calcBoundaryBox = (
  geodsic: { geodesicVertical: EllipsoidGeodesic; geodesicHorizontal: EllipsoidGeodesic },
  halfLength: number,
  halfWidth: number,
): {
  cartographicDimensions: {
    rightDemention: Cartographic;
    leftDemention: Cartographic;
    topDemention: Cartographic;
    bottomDemention: Cartographic;
  };
  cartesianArray: Cartesian3[];
} => {
  const topDemention = geodsic.geodesicVertical.interpolateUsingSurfaceDistance(halfLength);
  const bottomDemention = geodsic.geodesicVertical.interpolateUsingSurfaceDistance(-halfLength);
  const rightDemention = geodsic.geodesicHorizontal.interpolateUsingSurfaceDistance(halfWidth);
  const leftDemention = geodsic.geodesicHorizontal.interpolateUsingSurfaceDistance(-halfWidth);

  const rightTop = new Cartographic(rightDemention.longitude, topDemention.latitude, 0);
  const leftTop = new Cartographic(leftDemention.longitude, topDemention.latitude, 0);
  const rightBottom = new Cartographic(rightDemention.longitude, bottomDemention.latitude, 0);
  const leftBottom = new Cartographic(leftDemention.longitude, bottomDemention.latitude, 0);
  return {
    cartographicDimensions: {
      rightDemention,
      leftDemention,
      topDemention,
      bottomDemention,
    },
    cartesianArray: [
      Cartographic.toCartesian(rightTop),
      Cartographic.toCartesian(leftTop),
      Cartographic.toCartesian(leftBottom),
      Cartographic.toCartesian(rightBottom),
      Cartographic.toCartesian(rightTop),
    ],
  };
};

export const getAllowedCameraDestination = (
  camera: Camera,
  limiterDimensions: InnerLimiterDimensions,
): Cartesian3 => {
  const cameraPosition = Cartographic.fromDegrees(camera?.lng, camera?.lat, camera?.height);

  const destination = new Cartographic(
    Math.clamp(
      cameraPosition.longitude,
      limiterDimensions.cartographicDimensions.leftDemention.longitude,
      limiterDimensions.cartographicDimensions.rightDemention.longitude,
    ),
    Math.clamp(
      cameraPosition.latitude,
      limiterDimensions.cartographicDimensions.bottomDemention.latitude,
      limiterDimensions.cartographicDimensions.topDemention.latitude,
    ),
    cameraPosition.height,
  );
  return Cartographic.toCartesian(destination);
};
