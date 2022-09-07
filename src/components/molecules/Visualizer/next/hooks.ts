import { useSetAtom, useAtomValue } from "jotai";
import { useCallback, useEffect, useMemo } from "react";

import { computeAtom } from "./atoms";
import { Layer } from "./types";

export default function useHooks(layer?: Layer) {
  const atoms = useMemo(() => computeAtom(), []);
  const computedLayer = useAtomValue(atoms.get);
  const setLayer = useSetAtom(atoms.set);
  const writeFeatures = useSetAtom(atoms.writeFeatures);

  const handleFeatureRequest = useCallback(async () => {
    throw new Error("todo"); // TODO
  }, []);

  const handleFeatureDelete = useCallback(() => {
    throw new Error("todo"); // TODO
  }, []);

  useEffect(() => {
    setLayer(layer && !layer.hidden ? layer : undefined);
  }, [layer, setLayer]);

  return {
    computedLayer,
    handleFeatureRequest,
    handleFeatureFetch: writeFeatures,
    handleFeatureDelete,
  };
}
