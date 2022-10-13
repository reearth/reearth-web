import type { LineString, Point, Polygon } from "geojson";

import type { Infobox, Block, Tag } from "../Plugin/types";

// Layer

export type Layer = LayerSimple | LayerGroup;

export type LayerSimple = {
  type: "simple";
  data?: Data;
  properties?: any;
} & Partial<LayerAppearanceTypes> &
  LayerCommon;

export type LayerGroup = {
  type: "group";
  children: Layer[];
} & LayerCommon;

export type LayerCommon = {
  id: string;
  title?: string;
  /** default is true */
  visible?: boolean;
  infobox?: Infobox;
  tags?: Tag[];
  creator?: string;
  compat?: LayerCompat;
};

export type LayerCompat = { extensionId?: string; property?: any; propertyId?: string };

/** Same as a Layer, but its ID is unknown. */
export type NaiveLayer = NaiveLayerSimple | NaiveLayerGroup;
export type NaiveLayerSimple = Omit<LayerSimple, "id" | "infobox"> & { infobox?: NaiveInfobox };
export type NaiveLayerGroup = Omit<LayerGroup, "id" | "children" | "infobox"> & {
  infobox?: NaiveInfobox;
  children?: NaiveLayer[];
};
export type NaiveInfobox = Omit<Infobox, "id" | "blocks"> & { blocks?: NaiveBlock[] };
export type NaiveBlock<P = any> = Omit<Block<P>, "id">;

// Data

export type Data = {
  type: DataType;
  url?: string;
  value?: any;
};

export type DataRange = {
  x: number;
  y: number;
  z: number;
};

export type DataType = "geojson" | "3dtiles" | "gltf";

// Feature

export type Feature = {
  id: string;
  geometry?: Geometry;
  properties?: any;
  range?: DataRange;
};

export type Geometry = Point | LineString | Polygon;

export type ComputedLayerStatus = "fetching" | "ready";

// Computed

export type ComputedLayer = {
  id: string;
  status: ComputedLayerStatus;
  layer: Layer;
  originalFeatures: Feature[];
  features: ComputedFeature[];
  properties?: any;
} & Partial<AppearanceTypes>;

export type ComputedFeature = Feature & Partial<AppearanceTypes>;

// Appearance

export type LayerAppearance<T> = {
  [K in keyof T]?: T[K] | Expression;
};

export type Expression = {
  conditions: [string, string][];
};

export type AppearanceTypes = {
  marker: MarkerAppearance;
  polyline: PolylineAppearance;
  polygon: PolygonAppearance;
  model: ModelAppearance;
  "3dtiles": Cesium3DTilesAppearance;
  ellipsoid: EllipsoidAppearance;
  legacy_photooverlay: LegacyPhotooverlayAppearance;
  legacy_resource: LegacyResourceAppearance;
};

export type LayerAppearanceTypes = {
  [K in keyof AppearanceTypes]: LayerAppearance<AppearanceTypes[K]>;
};

export type MarkerAppearance = {
  pointSize?: number;
  pointColor?: string;
  // TODO
};

export type PolylineAppearance = {
  // TODO
};

export type PolygonAppearance = {
  // TODO
};

export type EllipsoidAppearance = {
  // TODO
};

export type ModelAppearance = {
  // TODO
};

export type Cesium3DTilesAppearance = {
  // TODO
};

export type LegacyPhotooverlayAppearance = {
  // TODO
};

export type LegacyResourceAppearance = {
  // TODO
};
