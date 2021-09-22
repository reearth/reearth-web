import { createContext, useContext } from "react";

import type { Ref as EngineRef } from "./Engine";
import type { Camera, Primitive, OverriddenInfobox } from "./Plugin/types";

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
