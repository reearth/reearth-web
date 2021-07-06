import React, {
  ForwardRefRenderFunction,
  PropsWithChildren,
  ComponentType,
  PropsWithoutRef,
  ReactNode,
  RefAttributes,
} from "react";

import type { Camera } from "@reearth/util/value";
import Cesium from "./Cesium";
import type { EngineRef } from "./ref";

export type EngineProps<SP = any> = {
  className?: string;
  isEditable?: boolean;
  isBuilt?: boolean;
  property?: SP;
  camera?: Camera;
  small?: boolean;
  children?: ReactNode;
  ready?: boolean;
  selectedPrimitiveId?: string;
  onPrimitiveSelect?: (id?: string, reason?: string) => void;
  onCameraChange?: (camera: Camera) => void;
};
export type Component = ComponentType<PropsWithoutRef<EngineProps> & RefAttributes<Ref>>;
export type Props = PropsWithChildren<EngineProps & { engine?: Engine }>;
export type Ref = EngineRef;
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
