import { createContext, useContext } from "react";

import type { Camera, Primitive, OverriddenInfobox } from "@reearth/plugin";

import type { Ref as EngineRef } from "./Engine";

export type { GlobalThis } from "@reearth/plugin";

export type VisualizerContext = {
  engine?: EngineRef;
  camera?: Camera;
  primitives?: Primitive[];
  selectedPrimitive?: Primitive;
  primitiveSelectionReason?: string;
  primitiveOverridenInfobox?: OverriddenInfobox;
  showPrimitive: (...id: string[]) => void;
  hidePrimitive: (...id: string[]) => void;
  selectPrimitive: (id?: string, options?: { reason?: string }) => void;
};

export const context = createContext<VisualizerContext | undefined>(undefined);
export const { Provider } = context;
export const useVisualizerContext = (): VisualizerContext | undefined => useContext(context);
