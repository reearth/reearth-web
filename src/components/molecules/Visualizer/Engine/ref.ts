import { LatLngHeight } from "@reearth/util/value";
import type { Component } from "../primitive";

export type EngineRef = {
  name: string;
  requestRender: () => void;
  getLocationFromScreenXY: (x: number, y: number) => LatLngHeight | undefined;
  flyTo: (destination: FlyToDestination, options?: CameraOptions) => void;
  lookAt: (destination: LookAtDestination, options?: CameraOptions) => void;
  zoomIn: (amount: number) => void;
  zoomOut: (amount: number) => void;
  isMarshalable?: (target: any) => boolean;
  builtinPrimitives?: Record<string, Component>;
  pluginApi?: any;
};

export type FlyToDestination = {
  lat?: number;
  lng?: number;
  height?: number;
  heading?: number;
  pitch?: number;
  roll?: number;
  fov?: number;
};

export type LookAtDestination = {
  lat?: number;
  lng?: number;
  height?: number;
  heading?: number;
  pitch?: number;
  range?: number;
  fov?: number;
};

export type CameraOptions = {
  duration?: number;
  easing?: (time: number) => number;
};
