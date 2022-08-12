// layers

export type Layer = LayerSimple;

export type LayerCommon = {
  id: string;
  name: string;
  infobox?: Infobox;
};

export type LayerSimple = {
  type: "simple";
  data?: DataSource;
} & {
  [t in FeatureType]?: LayerSimpleProperty;
} & LayerCommon;

export type LayerSimpleProperty = Record<string, LayerSimplePropertyValue>;

export type LayerSimplePropertyValue =
  | string
  | number
  | boolean
  | null
  | PropertyLink
  | PropertyConditions;

export type PropertyLink = {
  /** JSON Path */
  link: string;
};

export type PropertyConditions = {
  conditions: string;
};

// Data source

export type DataType = "geojson" | "czml" | "mvt" | "wmts";

export type DataSource = {
  type?: DataType;
  url: string;
};

export type Data = {
  type: DataType;
  url: string;
  range?: DataRange;
  features?: Feature[];
  data?: any;
};

export type DataRange = {
  x?: number;
  y?: number;
  z?: number;
};

// features

export type Feature = {
  id: string;
  type: FeatureType;
  geometry?: Geometry;
  data?: any;
  infobox?: Infobox;
};

export type FeatureType = "point" | "polyline" | "polygon" | "3dtiles" | "basemap";

// computed

export type ComputedLayer = {
  id: string;
  layer: Layer;
  state: ComputedLayerState;
  features: ComputedFeature[];
  infobox?: Infobox;
};

export type ComputedLayerState = "idle" | "evaluating" | "loading" | "finished";

export type ComputedFeature = {
  id: string;
  feature: Feature;
  geometry?: Geometry;
  property?: any;
  infobox?: Infobox;
};

// infobox

export type Infobox = {
  property?: any;
  computedProperty?: any;
  blocks: InfoboxBlock[];
};

export type InfoboxBlock = {
  id: string;
  pluginId: string;
  extensionId: string;
  /** pluginId/extensionId */
  type: string;
  property?: any;
  computedProperty?: any;
};

// geometries

export type Position = number[];

export type Geometry =
  | Point
  | MultiPoint
  | LineString
  | MultiLineString
  | Polygon
  | MultiPolygon
  | Rect
  | Sphere
  | Box;

export type GeometryWithCollection<G extends Geometry> = Geometry | GeometryCollection<G>;

export interface Point {
  type: "Point";
  coordinates: Position;
}

export type MultiPoint = {
  type: "MultiPoint";
  coordinates: Position[];
};

export type LineString = {
  type: "LineString";
  coordinates: Position[];
};

export type MultiLineString = {
  type: "MultiLineString";
  coordinates: Position[][];
};

export type Polygon = {
  type: "Polygon";
  coordinates: Position[][];
};

export type MultiPolygon = {
  type: "MultiPolygon";
  coordinates: Position[][][];
};

export type GeometryCollection<G extends Geometry> = {
  type: "GeometryCollection";
  geometries: G[];
};

export type Rect = {
  type: "rect";
  west: number;
  east: number;
  north: number;
  south: number;
};

export type Sphere = {
  type: "sphere";
  center: Position;
  radii: number;
};

export type Box = {
  type: "box";
  center: Position;
  width: number;
  height: number;
  length: number;
};

// components

export type Evaluator = (layer: Layer) => Promise<ComputedLayer>;

export type DataLoader = (source: DataSource, range?: DataRange) => Promise<Data>;
