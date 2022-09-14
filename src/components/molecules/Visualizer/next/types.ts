import type { Geometry as GeoJSONGeometry } from "geojson";

import type { Infobox, Tag } from "../Plugin/types";

// Layer
// Do not forget to update layerKeys also

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
  hidden?: boolean;
  infobox?: Infobox;
  tags?: Tag[];
};

// Data

export type Data = {
  type: DataType;
  url: string;
};

export type DataRange = {
  x: number;
  y: number;
  z: number;
};

export type DataType = "geojson";

// Feature

export type Feature = {
  id: string;
  geometry: Geometry;
  properties?: any;
  range?: DataRange;
};

export type Geometry = GeoJSONGeometry;

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
};

export type LayerAppearanceTypes = {
  [K in keyof AppearanceTypes]: LayerAppearance<AppearanceTypes[K]>;
};

export type MarkerAppearance = {
  pointSize?: number;
  pointColor?: string;
};
