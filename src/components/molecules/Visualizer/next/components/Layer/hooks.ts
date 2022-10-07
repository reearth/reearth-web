import { useSetAtom, useAtomValue } from "jotai";
import { useEffect, useMemo } from "react";

import { computeAtom, type Atoms } from "../../atoms";
import type { Layer } from "../../types";

export type { Atoms } from "../../atoms";

export const createAtoms = computeAtom;

export default function useHooks(layer: Layer | undefined, atoms?: Atoms) {
  const a = useMemo(() => atoms ?? createAtoms(), [atoms]);
  const computedLayer = useAtomValue(a.get);
  const setLayer = useSetAtom(a.set);
  const writeFeatures = useSetAtom(a.writeFeatures);
  const requestFetch = useSetAtom(a.requestFetch);
  const deleteFeatures = useSetAtom(a.deleteFeatures);

  useEffect(() => {
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
