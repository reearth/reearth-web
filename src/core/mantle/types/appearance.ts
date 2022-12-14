import { objKeys } from "../utils";

import type { Camera, LatLng, Typography } from "./value";

export type LayerAppearance<T> = {
  [K in keyof T]?: T[K] | Expression;
};

export type Expression = {
  conditions: [string, string][];
};

export type LayerAppearanceTypes = {
  [K in keyof AppearanceTypes]: LayerAppearance<AppearanceTypes[K]>;
};

export type AppearanceTypes = {
  marker: MarkerAppearance;
  polyline: PolylineAppearance;
  polygon: PolygonAppearance;
  model: ModelAppearance;
  "3dtiles": Cesium3DTilesAppearance;
  ellipsoid: EllipsoidAppearance;
  photooverlay: LegacyPhotooverlayAppearance;
  legacy_resource: LegacyResourceAppearance;
};

export type MarkerAppearance = {
  heightReference?: "none" | "clamp" | "relative";
  style?: "none" | "point" | "image";
  pointSize?: number;
  pointColor?: string;
  pointOutlineColor?: string;
  pointOutlineWidth?: number;
  image?: string;
  imageSize?: number;
  imageHorizontalOrigin?: "left" | "center" | "right";
  imageVerticalOrigin?: "top" | "center" | "baseline" | "bottom";
  imageColor?: string;
  imageCrop?: "none" | "rounded" | "circle";
  imageShadow?: boolean;
  imageShadowColor?: string;
  imageShadowBlur?: number;
  imageShadowPositionX?: number;
  imageShadowPositionY?: number;
  label?: boolean;
  labelText?: string;
  labelPosition?:
    | "left"
    | "right"
    | "top"
    | "bottom"
    | "lefttop"
    | "leftbottom"
    | "righttop"
    | "rightbottom";
  labelTypography?: Typography;
  labelBackground?: boolean;
  extrude?: boolean;
};

export type PolylineAppearance = {
  clampToGround?: boolean;
  strokeColor?: string;
  strokeWidth?: number;
  shadows?: "disabled" | "enabled" | "cast_only" | "receive_only";
};

export type PolygonAppearance = {
  fill?: boolean;
  fillColor?: string;
  stroke?: boolean;
  strokeColor?: string;
  strokeWidth?: number;
  heightReference?: "none" | "clamp" | "relative";
  shadows?: "disabled" | "enabled" | "cast_only" | "receive_only";
};

export type EllipsoidAppearance = {
  heightReference?: "none" | "clamp" | "relative";
  shadows?: "disabled" | "enabled" | "cast_only" | "receive_only";
  radius?: number;
  fillColor?: string;
};

export type ModelAppearance = {
  model?: string;
  heightReference?: "none" | "clamp" | "relative";
  heading?: number;
  pitch?: number;
  roll?: number;
  scale?: number;
  maximumScale?: number;
  minimumPixelSize?: number;
  animation?: boolean; // default: true
  shadows?: "disabled" | "enabled" | "cast_only" | "receive_only";
  colorBlend?: "none" | "highlight" | "replace" | "mix";
  color?: string;
  colorBlendAmount?: number;
  lightColor?: string;
  silhouette?: boolean;
  silhouetteColor?: string;
  silhouetteSize?: number; // default: 1
};

export type Cesium3DTilesAppearance = {
  sourceType?: "url" | "osm";
  tileset?: string;
  styleUrl?: string;
  shadows?: "disabled" | "enabled" | "cast_only" | "receive_only";
};

export type LegacyPhotooverlayAppearance = {
  location?: LatLng;
  height?: number;
  heightReference?: "none" | "clamp" | "relative";
  camera?: Camera; // You may also update the field name in storytelling widget
  image?: string;
  imageSize?: number;
  imageHorizontalOrigin?: "left" | "center" | "right";
  imageVerticalOrigin?: "top" | "center" | "baseline" | "bottom";
  imageCrop?: "none" | "rounded" | "circle";
  imageShadow?: boolean;
  imageShadowColor?: string;
  imageShadowBlur?: number;
  imageShadowPositionX?: number;
  imageShadowPositionY?: number;
  photoOverlayImage?: string;
  photoOverlayDescription?: string;
};

export type LegacyResourceAppearance = {
  url?: string;
  type?: "geojson" | "kml" | "czml" | "auto";
  clampToGround?: boolean;
};

export const appearanceKeyObj: { [k in keyof AppearanceTypes]: 1 } = {
  marker: 1,
  polyline: 1,
  polygon: 1,
  ellipsoid: 1,
  model: 1,
  "3dtiles": 1,
  photooverlay: 1,
  legacy_resource: 1,
};

export const appearanceKeys = objKeys<keyof AppearanceTypes>(appearanceKeyObj);