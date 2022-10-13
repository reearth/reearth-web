import { useAtom } from "jotai";
import { useCallback, useLayoutEffect, useMemo } from "react";

import { computeAtom, type Atom } from "../../atoms";
import type { DataRange, Feature, Layer } from "../../types";

export type { Atom as Atoms } from "../../atoms";

export const createAtom = computeAtom;

export default function useHooks(
  layer: Layer | undefined,
  atom: Atom | undefined,
  overrides?: Record<string, any>,
) {
  const [computedLayer, set] = useAtom(useMemo(() => atom ?? createAtom(), [atom]));
  const writeFeatures = useCallback(
    (features: Feature[]) => set({ type: "writeFeatures", features }),
    [set],
  );
  const requestFetch = useCallback(
    (range: DataRange) => set({ type: "requestFetch", range }),
    [set],
  );
  const deleteFeatures = useCallback(
    (features: string[]) => set({ type: "deleteFeatures", features }),
    [set],
  );

  useLayoutEffect(() => {
    set({
      type: "override",
      overrides,
    });
  }, [set, overrides]);

  useLayoutEffect(() => {
    set({
      type: "setLayer",
      layer:
        typeof layer?.visible === "undefined" || layer?.type === null || layer?.type
          ? layer
          : undefined,
    });
  }, [layer, set]);

  return {
    computedLayer,
    handleFeatureRequest: requestFetch,
    handleFeatureFetch: writeFeatures,
    handleFeatureDelete: deleteFeatures,
  };
}
