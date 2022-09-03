import type { Geometry as GeoJSONGeometry } from "geojson";

export type Layer = {
  id: string;
  type: "simple";
  data?: Data;
  properties?: any;
};

export type TreeLayer = Layer & {
  children?: Layer[];
};

export type Data = {
  type: DataType;
  url: string;
};

export type DataType = "geojson";

export type Feature = {
  id: string;
  geometry: Geometry;
  properties?: any;
};

export type Geometry = GeoJSONGeometry;

export type DataRange = {
  x: number;
  y: number;
  z: number;
};
