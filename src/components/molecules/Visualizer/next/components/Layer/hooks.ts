import { useAtom } from "jotai";
import { useCallback, useLayoutEffect, useMemo } from "react";

import { computeAtom, type Atom } from "../../atoms";
import type { DataRange, Feature, Layer } from "../../types";

export type { Atom as Atoms } from "../../atoms";

export const createAtom = computeAtom;

export default function useHooks(layer: Layer | undefined, atom?: Atom) {
  const [computedLayer, setters] = useAtom(useMemo(() => atom ?? createAtom(), [atom]));
  const setLayer = useCallback(
    (layer: Layer | undefined) => setters({ type: "setLayer", layer }),
    [setters],
  );
  const writeFeatures = useCallback(
    (features: Feature[]) => setters({ type: "writeFeatures", features }),
    [setters],
  );
  const requestFetch = useCallback(
    (range: DataRange) => setters({ type: "requestFetch", range }),
    [setters],
  );
  const deleteFeatures = useCallback(
    (features: string[]) => setters({ type: "deleteFeatures", features }),
    [setters],
  );

  useLayoutEffect(() => {
    setLayer(
      typeof layer?.visible === "undefined" || layer?.type === null || layer?.type
        ? layer
        : undefined,
    );
  }, [layer, setLayer]);

  return {
    computedLayer,
    handleFeatureRequest: requestFetch,
    handleFeatureFetch: writeFeatures,
    handleFeatureDelete: deleteFeatures,
  };
}
