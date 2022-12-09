import type {
  ForwardRefExoticComponent,
  PropsWithoutRef,
  RefAttributes,
  ReactNode,
  CSSProperties,
} from "react";

import type { LatLngHeight, Camera, Rect, LatLng } from "../../mantle";
import type { FeatureComponentType, ClusterComponentType } from "../Layers";

export type {
  FeatureComponentProps,
  FeatureComponentType,
  ClusterComponentType,
  ClusterComponentProps,
  ClusterProperty,
} from "../Layers";
export type {
  ComputedFeature,
  ComputedLayer,
  Geometry,
  AppearanceTypes,
  Camera,
  Typography,
  LatLng,
  Rect,
  LatLngHeight,
} from "../../mantle";

export type EngineRef = {
  [index in keyof MouseEventHandles]: MouseEventHandles[index];
} & {
  name: string;
  requestRender: () => void;
  getViewport: () => Rect | undefined;
  getCamera: () => Camera | undefined;
  getLocationFromScreen: (x: number, y: number, withTerrain?: boolean) => LatLngHeight | undefined;
  flyTo: (destination: FlyToDestination, options?: CameraOptions) => void;
  lookAt: (destination: LookAtDestination, options?: CameraOptions) => void;
  lookAtLayer: (layerId: string) => void;
  zoomIn: (amount: number, options?: CameraOptions) => void;
  zoomOut: (amount: number, options?: CameraOptions) => void;
  orbit: (radian: number) => void;
  rotateRight: (radian: number) => void;
  changeSceneMode: (sceneMode: SceneMode | undefined, duration?: number) => void;
  getClock: () => Clock | undefined;
  captureScreen: (type?: string, encoderOptions?: number) => string | undefined;
  enableScreenSpaceCameraController: (enabled: boolean) => void;
  lookHorizontal: (amount: number) => void;
  lookVertical: (amount: number) => void;
  moveForward: (amount: number) => void;
  moveBackward: (amount: number) => void;
  moveUp: (amount: number) => void;
  moveDown: (amount: number) => void;
  moveLeft: (amount: number) => void;
  moveRight: (amount: number) => void;
  moveOverTerrain: (offset?: number) => void;
  flyToGround: (destination: FlyToDestination, options?: CameraOptions, offset?: number) => void;
  mouseEventCallbacks: MouseEvents;
};

export type EngineProps = {
  className?: string;
  style?: CSSProperties;
  isEditable?: boolean;
  isBuilt?: boolean;
  property?: SceneProperty;
  camera?: Camera;
  small?: boolean;
  children?: ReactNode;
  ready?: boolean;
  selectedLayerId?: string;
  layerSelectionReason?: string;
  isLayerDraggable?: boolean;
  isLayerDragging?: boolean;
  shouldRender?: boolean;
  meta?: Record<string, unknown>;
  onLayerSelect?: (id?: string, options?: SelectLayerOptions) => void;
  onCameraChange?: (camera: Camera) => void;
  onTick?: (clock: Date) => void;
  onLayerDrag?: (layerId: string, position: LatLng) => void;
  onLayerDrop?: (layerId: string, propertyKey: string, position: LatLng | undefined) => void;
};

export type SelectLayerOptions = {
  reason?: string;
  overriddenInfobox?: OverriddenInfobox;
};

export type OverriddenInfobox = {
  title?: string;
  content: { key: string; value: string }[];
};

export type Clock = {
  current: Date;
  start?: Date;
  stop?: Date;
  speed?: number;
  playing?: boolean;
};

export type MouseEvent = {
  x?: number;
  y?: number;
  lat?: number;
  lng?: number;
  height?: number;
  layerId?: string;
  delta?: number;
};

export type MouseEvents = {
  click: ((props: MouseEvent) => void) | undefined;
  doubleclick: ((props: MouseEvent) => void) | undefined;
  mousedown: ((props: MouseEvent) => void) | undefined;
  mouseup: ((props: MouseEvent) => void) | undefined;
  rightclick: ((props: MouseEvent) => void) | undefined;
  rightdown: ((props: MouseEvent) => void) | undefined;
  rightup: ((props: MouseEvent) => void) | undefined;
  middleclick: ((props: MouseEvent) => void) | undefined;
  middledown: ((props: MouseEvent) => void) | undefined;
  middleup: ((props: MouseEvent) => void) | undefined;
  mousemove: ((props: MouseEvent) => void) | undefined;
  mouseenter: ((props: MouseEvent) => void) | undefined;
  mouseleave: ((props: MouseEvent) => void) | undefined;
  wheel: ((props: MouseEvent) => void) | undefined;
};

export type MouseEventHandles = {
  onClick: (fn: MouseEvents["click"]) => void;
  onDoubleClick: (fn: MouseEvents["doubleclick"]) => void;
  onMouseDown: (fn: MouseEvents["mousedown"]) => void;
  onMouseUp: (fn: MouseEvents["mouseup"]) => void;
  onRightClick: (fn: MouseEvents["rightclick"]) => void;
  onRightDown: (fn: MouseEvents["rightdown"]) => void;
  onRightUp: (fn: MouseEvents["rightup"]) => void;
  onMiddleClick: (fn: MouseEvents["middleclick"]) => void;
  onMiddleDown: (fn: MouseEvents["middledown"]) => void;
  onMiddleUp: (fn: MouseEvents["middleup"]) => void;
  onMouseMove: (fn: MouseEvents["mousemove"]) => void;
  onMouseEnter: (fn: MouseEvents["mouseenter"]) => void;
  onMouseLeave: (fn: MouseEvents["mouseleave"]) => void;
  onWheel: (fn: MouseEvents["wheel"]) => void;
};

export type SceneMode = "3d" | "2d" | "columbus";
export type IndicatorTypes = "default" | "crosshair" | "custom";

export type FlyToDestination = {
  /** Degrees */
  lat?: number;
  /** Degrees */
  lng?: number;
  /** Meters */
  height?: number;
  /** Radian */
  heading?: number;
  /** Radian */
  pitch?: number;
  /** Radian */
  roll?: number;
  /** Radian */
  fov?: number;
};

export type LookAtDestination = {
  /** Degrees */
  lat?: number;
  /** Degrees */
  lng?: number;
  /** Meters */
  height?: number;
  /** Radian */
  heading?: number;
  /** Radian */
  pitch?: number;
  /** Radian */
  range?: number;
  /** Radian */
  fov?: number;
};

export type CameraOptions = {
  /** Seconds */
  duration?: number;
  easing?: (time: number) => number;
  withoutAnimation?: boolean;
};

export type TerrainProperty = {
  terrain?: boolean;
  terrainType?: "cesium" | "arcgis" | "cesiumion"; // default: cesium
  terrainExaggeration?: number; // default: 1
  terrainExaggerationRelativeHeight?: number; // default: 0
  depthTestAgainstTerrain?: boolean;
  terrainCesiumIonAsset?: string;
  terrainCesiumIonAccessToken?: string;
  terrainCesiumIonUrl?: string;
  terrainUrl?: string;
};

export type SceneProperty = {
  default?: {
    camera?: Camera;
    allowEnterGround?: boolean;
    skybox?: boolean;
    bgcolor?: string;
    ion?: string;
    sceneMode?: SceneMode; // default: scene3d
  } & TerrainProperty;
  cameraLimiter?: {
    cameraLimitterEnabled?: boolean;
    cameraLimitterShowHelper?: boolean;
    cameraLimitterTargetArea?: Camera;
    cameraLimitterTargetWidth?: number;
    cameraLimitterTargetLength?: number;
  };
  indicator?: {
    indicator_type: IndicatorTypes;
    indicator_image?: string;
    indicator_image_scale?: number;
  };
  tiles?: {
    id: string;
    tile_type?: string;
    tile_url?: string;
    tile_maxLevel?: number;
    tile_minLevel?: number;
    tile_opacity?: number;
  }[];
  terrain?: TerrainProperty;
  atmosphere?: {
    enable_sun?: boolean;
    enable_lighting?: boolean;
    ground_atmosphere?: boolean;
    sky_atmosphere?: boolean;
    shadows?: boolean;
    fog?: boolean;
    fog_density?: number;
    brightness_shift?: number;
    hue_shift?: number;
    surturation_shift?: number;
  };
  timeline?: {
    animation?: boolean;
    visible?: boolean;
    current?: string;
    start?: string;
    stop?: string;
    stepType?: "rate" | "fixed";
    multiplier?: number;
    step?: number;
    rangeType?: "unbounded" | "clamped" | "bounced";
  };
  googleAnalytics?: {
    enableGA?: boolean;
    trackingId?: string;
  };
  theme?: {
    themeType?: "light" | "dark" | "forest" | "custom";
    themeTextColor?: string;
    themeSelectColor?: string;
    themeBackgroundColor?: string;
  };
};

export type EngineComponent = ForwardRefExoticComponent<
  PropsWithoutRef<EngineProps> & RefAttributes<EngineRef>
>;

export type Engine = {
  component: EngineComponent;
  featureComponent: FeatureComponentType;
  clusterComponent: ClusterComponentType;
};