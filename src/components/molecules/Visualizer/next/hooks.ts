import { useSetAtom, useAtomValue } from "jotai";
import { useEffect, useMemo } from "react";

import { computeAtom } from "./atoms";
import { Layer } from "./types";

export default function useHooks(layer?: Layer) {
  const atoms = useMemo(() => computeAtom(), []);
  const computedLayer = useAtomValue(atoms.get);
  const setLayer = useSetAtom(atoms.set);
  const writeFeatures = useSetAtom(atoms.writeFeatures);
  const requestFetch = useSetAtom(atoms.requestFetch);
  const deleteFeatures = useSetAtom(atoms.deleteFeatures);

  useEffect(() => {
    setLayer(layer && !layer.hidden ? layer : undefined);
  }, [layer, setLayer]);

  return {
    computedLayer,
    handleFeatureRequest: requestFetch,
    handleFeatureFetch: writeFeatures,
    handleFeatureDelete: deleteFeatures,
  };
}
