import { createContext, useContext } from "react";
import type { Component as PrimitiveComponent } from "./Primitive";

export type EngineAPI<T = any> = {
  builtinPrimitives?: Record<string, PrimitiveComponent>;
  engineAPI?: T;
};
export const context = createContext<EngineAPI | undefined>(undefined);
export const { Provider } = context;
export const useEngineAPI = <T>(): EngineAPI<T> | undefined => useContext(context);
