import { useMemo } from "react";
import { Viewer } from "cesium";
import { CesiumComponentRef } from "resium";

import type { EngineAPI } from "../../engineApi";
import builtinPrimitives from "./builtin";

export type CesiumAPI = {};

export default function useEngineAPI(_cesium: React.RefObject<CesiumComponentRef<Viewer>>) {
  return useMemo<EngineAPI<CesiumAPI>>(
    () => ({
      engineAPI: {},
      builtinPrimitives,
    }),
    [],
  );
}
