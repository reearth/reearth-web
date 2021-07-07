import { createContext, useContext } from "react";

import type { GlobalThis } from "@reearth/plugin";
import type { Ref as EngineRef } from "./engine";

export type CommonGlobalThis = Omit<GlobalThis, "reearth"> & {
  reearth: Omit<GlobalThis["reearth"], "plugin" | "ui" | "on" | "off" | "once" | "onupdate">;
};

export type VisualizerContext = {
  engine: () => EngineRef | null;
  pluginAPI?: CommonGlobalThis;
};

export const context = createContext<VisualizerContext | undefined>(undefined);
export const { Provider } = context;
export const useVisualizerContext = (): VisualizerContext | undefined => useContext(context);
