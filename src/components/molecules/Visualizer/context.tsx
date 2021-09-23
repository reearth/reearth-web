import { createContext, useContext } from "react";

import type { Ref as EngineRef } from "./Engine";
import type { Camera, Layer, OverriddenInfobox } from "./Plugin/types";

export type { Layer } from "./Plugin/types";

export type VisualizerContext = {
  engine?: EngineRef;
  camera?: Camera;
  layers?: Layer[];
  selectedLayer?: Layer;
  layerSelectionReason?: string;
  layerOverridenInfobox?: OverriddenInfobox;
  showLayer: (...id: string[]) => void;
  hideLayer: (...id: string[]) => void;
  selectLayer: (id?: string, options?: { reason?: string }) => void;
  findLayerById: (id: string) => Layer | undefined;
  findLayerByIds: (...ids: string[]) => (Layer | undefined)[];
};

export const context = createContext<VisualizerContext | undefined>(undefined);
export const { Provider } = context;
export const useVisualizerContext = (): VisualizerContext | undefined => useContext(context);
