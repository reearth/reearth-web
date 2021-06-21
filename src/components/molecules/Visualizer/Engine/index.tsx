import React, {
  ForwardRefRenderFunction,
  PropsWithChildren,
  ComponentType,
  PropsWithoutRef,
  ReactNode,
  RefAttributes,
} from "react";

import type { Camera } from "@reearth/util/value";
import type { CommonAPI } from "..";
import Cesium from "./Cesium";

export type EngineProps = {
  className?: string;
  isEditable?: boolean;
  isBuilt?: boolean;
  property?: any;
  camera?: Camera;
  small?: boolean;
  children?: ReactNode;
  ready?: boolean;
  selectedLayerId?: string;
  onLayerSelect?: (id?: string, reason?: string) => void;
  onCameraChange?: (camera: Camera) => void;
};
export type Component = ComponentType<PropsWithoutRef<EngineProps> & RefAttributes<Ref>>;
export type Props = PropsWithChildren<EngineProps & { engine?: Engine }>;
export type Ref = Pick<CommonAPI, "requestRender" | "getLocationFromScreenXY" | "flyTo">;
export type Engine = keyof typeof engines;

// TODO: lazy loading
const engines = {
  cesium: Cesium,
};

const Engine: ForwardRefRenderFunction<Ref, Props> = ({ engine, children, ...props }, ref) => {
  const Engine: Component | undefined = engine ? engines[engine] : undefined;

  return Engine ? (
    <Engine {...props} ref={ref}>
      {children}
    </Engine>
  ) : null;
};

export default React.forwardRef(Engine);
