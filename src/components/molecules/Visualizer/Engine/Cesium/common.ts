import { useCallback } from "react";
import {
  BoundingSphere,
  HeadingPitchRange,
  HorizontalOrigin,
  VerticalOrigin,
  Camera as CesiumCamera,
  Math as CesiumMath,
  Scene,
  Cartesian2,
  Cartesian3,
  Viewer,
} from "cesium";
import { useCanvas, useImage } from "@reearth/util/image";
import { FlyToCamera } from "../../commonApi";
import { Camera } from "@reearth/util/value";
import PerspectiveFrustum from "cesium/Source/Core/PerspectiveFrustum";
import { tweenInterval } from "@reearth/util/raf";

export const drawIcon = (
  c: HTMLCanvasElement,
  image: HTMLImageElement | undefined,
  imageSize = 1,
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

  const w = Math.floor(image.width * imageSize);
  const h = Math.floor(image.height * imageSize);
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
}): [HTMLCanvasElement, HTMLImageElement | undefined] => {
  const img = useImage(image);
  const draw = useCallback(
    can =>
      drawIcon(
        can,
        img,
        imageSize,
        crop,
        shadow,
        shadowColor,
        shadowBlur,
        shadowOffsetX,
        shadowOffsetY,
      ),
    [crop, imageSize, img, shadow, shadowBlur, shadowColor, shadowOffsetX, shadowOffsetY],
  );
  const canvas = useCanvas(draw);
  return [canvas, img];
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
  camera?: FlyToCamera,
  options?: {
    duration?: number;
    easing?: (time: number) => number;
  },
) => {
  if (!cesiumCamera || !camera) return () => {};

  const cancel = () => {
    cancelFov?.();
    cesiumCamera?.cancelFlight();
  };
  let cancelFov: () => void | undefined;

  // fov animation
  const toFov = camera.fov;
  if (
    typeof toFov === "number" &&
    cesiumCamera.frustum instanceof PerspectiveFrustum &&
    typeof cesiumCamera.frustum.fov === "number" &&
    cesiumCamera.frustum.fov !== toFov
  ) {
    const fromFov = cesiumCamera.frustum.fov;
    cancelFov = tweenInterval(
      t => {
        if (!(cesiumCamera.frustum instanceof PerspectiveFrustum)) return;
        cesiumCamera.frustum.fov = (toFov - fromFov) * t + fromFov;
      },
      options?.easing || "inOutCubic",
      options?.duration ?? 0,
    );
  }

  const position =
    typeof camera.lat === "number" &&
    typeof camera.lng === "number" &&
    typeof camera.height === "number"
      ? Cartesian3.fromDegrees(camera.lng, camera.lat, camera.height)
      : undefined;

  if (position) {
    if ("range" in camera) {
      cesiumCamera.flyToBoundingSphere(new BoundingSphere(position), {
        offset: new HeadingPitchRange(camera.heading, camera.pitch, camera.range),
        duration: options?.duration,
        easingFunction: options?.easing,
      });
    } else {
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
  }

  return cancel;
};

export const getCamera = (viewer: Viewer): Camera | undefined => {
  const { camera } = viewer;
  if (!(camera.frustum instanceof PerspectiveFrustum)) return;

  const ellipsoid = viewer.scene.globe.ellipsoid;
  const { latitude, longitude, height } = ellipsoid.cartesianToCartographic(camera.position);
  const lat = CesiumMath.toDegrees(latitude);
  const lng = CesiumMath.toDegrees(longitude);
  const { heading, pitch, roll } = camera;
  const { fov } = camera.frustum;

  return { lng, lat, height, heading, pitch, roll, fov };
};
