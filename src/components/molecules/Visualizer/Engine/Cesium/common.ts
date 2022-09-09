import {
  ColorBlendMode,
  BoundingSphere,
  HeadingPitchRange,
  HorizontalOrigin,
  VerticalOrigin,
  Camera as CesiumCamera,
  Math as CesiumMath,
  Scene,
  Cartesian2,
  Cartesian3,
  CesiumWidget,
  PerspectiveFrustum,
  OrthographicOffCenterFrustum,
  Viewer,
  HeightReference,
  ShadowMode,
  Entity,
  PropertyBag,
  Clock as CesiumClock,
  JulianDate,
  ClockStep,
  Ellipsoid,
  Quaternion,
  Matrix3,
  Cartographic,
  EllipsoidTerrainProvider,
  sampleTerrainMostDetailed,
} from "cesium";
import { useCallback, MutableRefObject } from "react";

import { useCanvas, useImage } from "@reearth/util/image";
import { tweenInterval } from "@reearth/util/raf";
import { Camera } from "@reearth/util/value";

import { Clock } from "../../Plugin/types";

export const layerIdField = `__reearth_layer_id`;

const defaultImageSize = 50;

export const drawIcon = (
  c: HTMLCanvasElement,
  image: HTMLImageElement | undefined,
  w: number,
  h: number,
  crop: "circle" | "rounded" | "none" = "none",
  shadow = false,
  shadowColor = "rgba(0, 0, 0, 0.7)",
  shadowBlur = 3,
  shadowOffsetX = 0,
  shadowOffsetY = 0,
) => {
  const ctx = c.getContext("2d");
  if (!image || !ctx) return;

  ctx.save();

  c.width = w + shadowBlur;
  c.height = h + shadowBlur;
  ctx.shadowBlur = shadowBlur;
  ctx.shadowOffsetX = shadowOffsetX;
  ctx.shadowOffsetY = shadowOffsetY;
  ctx.globalCompositeOperation = "source-over";
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.drawImage(image, (c.width - w) / 2, (c.height - h) / 2, w, h);

  if (crop === "circle") {
    ctx.fillStyle = "black";
    ctx.globalCompositeOperation = "destination-in";
    ctx.arc(w / 2, h / 2, Math.min(w, h) / 2, 0, 2 * Math.PI);
    ctx.fill();

    if (shadow) {
      ctx.shadowColor = shadowColor;
      ctx.globalCompositeOperation = "destination-over";
      ctx.fillStyle = "black";
      ctx.arc(w / 2, h / 2, Math.min(w, h) / 2, 0, 2 * Math.PI);
      ctx.fill();
    }
  } else if (shadow) {
    ctx.shadowColor = shadowColor;
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = "black";
    ctx.rect((c.width - w) / 2, (c.height - h) / 2, w, h);
    ctx.fill();
  }

  ctx.restore();
};

export const useIcon = ({
  image,
  imageSize,
  crop,
  shadow,
  shadowColor,
  shadowBlur,
  shadowOffsetX,
  shadowOffsetY,
}: {
  image?: string;
  imageSize?: number;
  crop?: "circle" | "rounded" | "none";
  shadow?: boolean;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
}): [string, number, number] => {
  const img = useImage(image);

  const w = !img
    ? 0
    : typeof imageSize === "number"
    ? Math.floor(img.width * imageSize)
    : Math.min(defaultImageSize, img.width);
  const h = !img
    ? 0
    : typeof imageSize === "number"
    ? Math.floor(img.height * imageSize)
    : Math.floor((w / img.width) * img.height);

  const draw = useCallback(
    (can: HTMLCanvasElement) =>
      drawIcon(can, img, w, h, crop, shadow, shadowColor, shadowBlur, shadowOffsetX, shadowOffsetY),
    [crop, h, img, shadow, shadowBlur, shadowColor, shadowOffsetX, shadowOffsetY, w],
  );
  const canvas = useCanvas(draw);
  return [canvas, w, h];
};

export const ho = (o: "left" | "center" | "right" | undefined): HorizontalOrigin | undefined =>
  ({
    left: HorizontalOrigin.LEFT,
    center: HorizontalOrigin.CENTER,
    right: HorizontalOrigin.RIGHT,
    [""]: undefined,
  }[o || ""]);

export const vo = (
  o: "top" | "center" | "baseline" | "bottom" | undefined,
): VerticalOrigin | undefined =>
  ({
    top: VerticalOrigin.TOP,
    center: VerticalOrigin.CENTER,
    baseline: VerticalOrigin.BASELINE,
    bottom: VerticalOrigin.BOTTOM,
    [""]: undefined,
  }[o || ""]);

export const getLocationFromScreenXY = (scene: Scene | undefined | null, x: number, y: number) => {
  if (!scene) return undefined;
  const camera = scene.camera;
  const ellipsoid = scene.globe.ellipsoid;
  const cartesian = camera?.pickEllipsoid(new Cartesian2(x, y), ellipsoid);
  if (!cartesian) return undefined;
  const { latitude, longitude, height } = ellipsoid.cartesianToCartographic(cartesian);
  return {
    lat: CesiumMath.toDegrees(latitude),
    lng: CesiumMath.toDegrees(longitude),
    height,
  };
};

export const flyTo = (
  cesiumCamera?: CesiumCamera,
  camera?: {
    /** degrees */
    lat?: number;
    /** degrees */
    lng?: number;
    /** meters */
    height?: number;
    /** radians */
    heading?: number;
    /** radians */
    pitch?: number;
    /** radians */
    roll?: number;
    /** Field of view expressed in radians */
    fov?: number;
  },
  options?: {
    /** Seconds */
    duration?: number;
    easing?: (time: number) => number;
  },
) => {
  if (!cesiumCamera || !camera) return () => {};

  const cancelFov = animateFOV({
    fov: camera.fov,
    camera: cesiumCamera,
    duration: options?.duration,
    easing: options?.easing,
  });

  const position =
    typeof camera.lat === "number" &&
    typeof camera.lng === "number" &&
    typeof camera.height === "number"
      ? Cartesian3.fromDegrees(camera.lng, camera.lat, camera.height)
      : undefined;

  if (position) {
    cesiumCamera.flyTo({
      destination: position,
      orientation: {
        heading: camera.heading,
        pitch: camera.pitch,
        roll: camera.roll,
      },
      duration: options?.duration ?? 0,
      easingFunction: options?.easing,
    });
  }

  return () => {
    cancelFov?.();
    cesiumCamera?.cancelFlight();
  };
};

export const lookAt = (
  cesiumCamera?: CesiumCamera,
  camera?: {
    /** degrees */
    lat?: number;
    /** degrees */
    lng?: number;
    /** meters */
    height?: number;
    /** radians */
    heading?: number;
    /** radians */
    pitch?: number;
    /** radians */
    range?: number;
    /** Field of view expressed in radians */
    fov?: number;
  },
  options?: {
    /** Seconds */
    duration?: number;
    easing?: (time: number) => number;
  },
) => {
  if (!cesiumCamera || !camera) return () => {};

  const cancelFov = animateFOV({
    fov: camera.fov,
    camera: cesiumCamera,
    duration: options?.duration,
    easing: options?.easing,
  });

  const position =
    typeof camera.lat === "number" &&
    typeof camera.lng === "number" &&
    typeof camera.height === "number"
      ? Cartesian3.fromDegrees(camera.lng, camera.lat, camera.height)
      : undefined;

  if (position) {
    cesiumCamera.flyToBoundingSphere(new BoundingSphere(position), {
      offset: new HeadingPitchRange(camera.heading, camera.pitch, camera.range),
      duration: options?.duration,
      easingFunction: options?.easing,
    });
  }

  return () => {
    cancelFov?.();
    cesiumCamera?.cancelFlight();
  };
};

export const animateFOV = ({
  fov,
  camera,
  easing,
  duration,
}: {
  fov?: number;
  camera: CesiumCamera;
  easing?: (t: number) => number;
  duration?: number;
}): (() => void) | undefined => {
  // fov animation
  if (
    typeof fov === "number" &&
    camera.frustum instanceof PerspectiveFrustum &&
    typeof camera.frustum.fov === "number" &&
    camera.frustum.fov !== fov
  ) {
    const fromFov = camera.frustum.fov;
    return tweenInterval(
      t => {
        if (!(camera.frustum instanceof PerspectiveFrustum)) return;
        camera.frustum.fov = (fov - fromFov) * t + fromFov;
      },
      easing || "inOutCubic",
      (duration ?? 0) * 1000,
    );
  }
  return undefined;
};

export const getCamera = (viewer: Viewer | CesiumWidget | undefined): Camera | undefined => {
  if (!viewer || viewer.isDestroyed() || !viewer.camera || !viewer.scene) return undefined;
  const { camera } = viewer;
  if (
    !(
      camera.frustum instanceof PerspectiveFrustum ||
      camera.frustum instanceof OrthographicOffCenterFrustum
    )
  )
    return;
  const { latitude, longitude, height } = camera.positionCartographic;
  const lat = CesiumMath.toDegrees(latitude);
  const lng = CesiumMath.toDegrees(longitude);
  const { heading, pitch, roll } = camera;
  const fov = camera.frustum instanceof PerspectiveFrustum ? camera.frustum.fov : 1;
  return { lng, lat, height, heading, pitch, roll, fov };
};

export const getClock = (clock: CesiumClock | undefined): Clock | undefined => {
  if (!clock) return undefined;
  return {
    // Getter
    get startTime() {
      return JulianDate.toDate(clock.startTime);
    },
    get stopTime() {
      return JulianDate.toDate(clock.stopTime);
    },
    get currentTime() {
      return JulianDate.toDate(clock.currentTime);
    },
    get tick() {
      return () => JulianDate.toDate(clock.tick());
    },
    get playing() {
      return clock.shouldAnimate;
    },
    get paused() {
      return !clock.shouldAnimate;
    },
    get speed() {
      return clock.multiplier;
    },

    // Setter
    set startTime(d: Date) {
      clock["startTime"] = JulianDate.fromDate(d);
    },
    set stopTime(d: Date) {
      clock["stopTime"] = JulianDate.fromDate(d);
    },
    set currentTime(d: Date) {
      clock["currentTime"] = JulianDate.fromDate(d);
    },
    set tick(cb: () => Date) {
      clock["tick"] = () => JulianDate.fromDate(cb());
    },
    set playing(v: boolean) {
      clock["shouldAnimate"] = v;
    },
    set paused(v: boolean) {
      clock["shouldAnimate"] = !v;
    },
    set speed(v: number) {
      clock["multiplier"] = v;
      // Force multiplier
      clock["clockStep"] = ClockStep.SYSTEM_CLOCK_MULTIPLIER;
    },

    // methods
    get play() {
      return () => {
        clock["shouldAnimate"] = true;
      };
    },
    get pause() {
      return () => {
        clock["shouldAnimate"] = false;
      };
    },
  };
};

export const colorBlendMode = (colorBlendMode?: "highlight" | "replace" | "mix" | "none") =>
  ((
    {
      highlight: ColorBlendMode.HIGHLIGHT,
      replace: ColorBlendMode.REPLACE,
      mix: ColorBlendMode.MIX,
    } as { [key in string]?: ColorBlendMode }
  )[colorBlendMode || ""]);

export const heightReference = (
  heightReference?: "none" | "clamp" | "relative",
): HeightReference | undefined =>
  ((
    { clamp: HeightReference.CLAMP_TO_GROUND, relative: HeightReference.RELATIVE_TO_GROUND } as {
      [key in string]?: HeightReference;
    }
  )[heightReference || ""]);

export const shadowMode = (
  shadows?: "disabled" | "enabled" | "cast_only" | "receive_only",
): ShadowMode | undefined =>
  ((
    {
      enabled: ShadowMode.ENABLED,
      cast_only: ShadowMode.CAST_ONLY,
      receive_only: ShadowMode.RECEIVE_ONLY,
    } as {
      [key in string]?: ShadowMode;
    }
  )[shadows || ""]);

export const unselectableTag = "reearth_unselectable";
export const draggableTag = "reearth_draggable";

export function isSelectable(e: Entity | undefined): boolean {
  return !e?.properties?.hasProperty(unselectableTag);
}

export function isDraggable(e: Entity): string | undefined {
  return e.properties?.getValue(new JulianDate())?.[draggableTag];
}

export function attachTag(entity: Entity | undefined, tag: string, value: any) {
  if (!entity) return;
  if (typeof value !== "undefined" && !entity.properties) {
    entity.properties = new PropertyBag({ [tag]: value });
  } else if (typeof value === "undefined") {
    entity.properties?.removeProperty(tag);
  } else if (entity.properties?.hasProperty(tag)) {
    entity.properties?.removeProperty(tag);
    entity.properties?.addProperty(tag, value);
  } else {
    entity.properties?.addProperty(tag, value);
  }
}

export function lookHorizontal(viewer: Viewer, amount: number) {
  const camera = viewer.scene.camera;
  const ellipsoid = viewer.scene.globe.ellipsoid;
  const surfaceNormal = ellipsoid.geodeticSurfaceNormal(camera.position, new Cartesian3());
  camera.look(surfaceNormal, amount);
}

export function lookVertical(viewer: Viewer, amount: number) {
  const camera = viewer.scene.camera;
  const ellipsoid = viewer.scene.globe.ellipsoid;
  const lookAxis = projectVectorToSurface(camera.right, camera.position, ellipsoid);
  const surfaceNormal = ellipsoid.geodeticSurfaceNormal(camera.position, new Cartesian3());
  const currentAngle = CesiumMath.toDegrees(Cartesian3.angleBetween(surfaceNormal, camera.up));
  const upAfterLook = rotateVectorAboutAxis(camera.up, lookAxis, amount);
  const angleAfterLook = CesiumMath.toDegrees(Cartesian3.angleBetween(surfaceNormal, upAfterLook));
  const friction = angleAfterLook < currentAngle ? 1 : (90 - currentAngle) / 90;
  camera.look(lookAxis, amount * friction);
}

export function moveForward(viewer: Viewer, amount: number) {
  const direction = projectVectorToSurface(
    viewer.scene.camera.direction,
    viewer.scene.camera.position,
    viewer.scene.globe.ellipsoid,
  );
  viewer.scene.camera.move(direction, amount);
}

export function moveBackward(viewer: Viewer, amount: number) {
  const direction = projectVectorToSurface(
    viewer.scene.camera.direction,
    viewer.scene.camera.position,
    viewer.scene.globe.ellipsoid,
  );
  viewer.scene.camera.move(direction, -amount);
}

export function moveUp(viewer: Viewer, amount: number) {
  const surfaceNormal = viewer.scene.globe.ellipsoid.geodeticSurfaceNormal(
    viewer.scene.camera.position,
    new Cartesian3(),
  );
  viewer.scene.camera.move(surfaceNormal, amount);
}

export function moveDown(viewer: Viewer, amount: number) {
  const surfaceNormal = viewer.scene.globe.ellipsoid.geodeticSurfaceNormal(
    viewer.scene.camera.position,
    new Cartesian3(),
  );
  viewer.scene.camera.move(surfaceNormal, -amount);
}

export function moveLeft(viewer: Viewer, amount: number) {
  const direction = projectVectorToSurface(
    viewer.scene.camera.right,
    viewer.scene.camera.position,
    viewer.scene.globe.ellipsoid,
  );
  viewer.scene.camera.move(direction, -amount);
}

export function moveRight(viewer: Viewer, amount: number) {
  const direction = projectVectorToSurface(
    viewer.scene.camera.right,
    viewer.scene.camera.position,
    viewer.scene.globe.ellipsoid,
  );
  viewer.scene.camera.move(direction, amount);
}

export async function moveOverTerrain(viewer: Viewer, offset = 0) {
  const camera = viewer.scene.camera;
  const height = await sampleTerrainHeight(viewer.scene, camera.position);
  if (height && height !== 0) {
    const innerCamera = getCamera(viewer);
    if (innerCamera && innerCamera?.height < height + offset) {
      camera.moveUp(height + offset - innerCamera.height);
    }
  }
}

export async function flyToGround(
  viewer: Viewer,
  cancelCameraFlight: MutableRefObject<(() => void) | undefined>,
  camera?: {
    lat?: number;
    lng?: number;
    height?: number;
    heading?: number;
    pitch?: number;
    roll?: number;
    fov?: number;
  },
  options?: {
    duration?: number;
    easing?: (time: number) => number;
  },
  offset = 0,
) {
  const height = await sampleTerrainHeight(viewer.scene, viewer.scene.camera.position);
  const tarHeight = height ? height + offset : offset;
  const groundCamera = { ...camera, height: tarHeight };
  cancelCameraFlight.current?.();
  cancelCameraFlight.current = flyTo(
    viewer.scene?.camera,
    { ...getCamera(viewer), ...groundCamera },
    options,
  );
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

function rotateVectorAboutAxis(vector: Cartesian3, rotateAxis: Cartesian3, rotateAmount: number) {
  const quaternion = Quaternion.fromAxisAngle(rotateAxis, -rotateAmount, new Quaternion());
  const rotation = Matrix3.fromQuaternion(quaternion, new Matrix3());
  const rotatedVector = Matrix3.multiplyByVector(rotation, vector, vector.clone());
  return rotatedVector;
}

async function sampleTerrainHeight(
  scene: Scene,
  position: Cartesian3,
): Promise<number | undefined> {
  const terrainProvider = scene.terrainProvider;
  if (terrainProvider instanceof EllipsoidTerrainProvider) return 0;

  const [sample] = await sampleTerrainMostDetailed(terrainProvider, [
    Cartographic.fromCartesian(position, scene.globe.ellipsoid, new Cartographic()),
  ]);
  return sample.height;
}
