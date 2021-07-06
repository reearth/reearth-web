export * from "./api";
export * from "../util/event";
import type { globalThis as globalThisType } from "./api";

export type CommonGlobalThis = Omit<GlobalThis, "reearth"> & {
  reearth: Omit<GlobalThis["reearth"], "plugin" | "ui">;
};

export type GlobalThis = globalThisType;
