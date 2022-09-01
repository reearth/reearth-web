import { useSetAtom, useAtomValue } from "jotai";
import { useCallback, useEffect, useMemo } from "react";

import { layerAtom } from "./atoms";
import { Layer } from "./types";

export default function useHooks(layer?: Layer) {
  const atoms = useMemo(() => layerAtom(), []);
  const features = useAtomValue(atoms.features);
  const setLayer = useSetAtom(atoms.writeLayer);
  // const writeFeatures = useSetAtom(atoms.writeFeatures);

  const handleFeatureRequest = useCallback(async () => {
    throw new Error("todo"); // TODO
  }, []);

  const handleFeatureFetch = useCallback(() => {
    throw new Error("todo"); // TODO
  }, []);

  const handleFeatureDelete = useCallback(() => {
    throw new Error("todo"); // TODO
  }, []);

  useEffect(() => {
    setLayer(layer);
  }, [layer, setLayer]);

  return { features, handleFeatureRequest, handleFeatureFetch, handleFeatureDelete };
}
