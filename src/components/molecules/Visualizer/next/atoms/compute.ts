import { atom } from "jotai";

import { evalLayer } from "../evaluator";
import type { ComputedLayer, ComputedLayerStatus, Data, DataRange, Feature, Layer } from "../types";

import { dataAtom, globalDataFeaturesCache } from "./data";

export function computeAtom(cache?: typeof globalDataFeaturesCache) {
  const layer = atom<Layer | undefined>(undefined);
  const computedFeatures = atom<Feature[]>([]);
  const layerStatus = atom<ComputedLayerStatus>("fetching");
  const dataAtoms = dataAtom(cache);

  const get = atom((get): ComputedLayer | undefined => {
    const currentLayer = get(layer);
    if (!currentLayer) return;

    return {
      id: currentLayer.id,
      layer: currentLayer,
      status: get(layerStatus),
      features: get(computedFeatures),
      originalFeatures: currentLayer.data ? get(dataAtoms.getAll)(currentLayer.data).flat() : [],
    };
  });

  const compute = atom(null, async (get, set, _: any) => {
    const currentLayer = get(layer);
    if (!currentLayer) return;

    set(layerStatus, "fetching");

    // Used for a simple layer.
    // It retrieves all features for the layer stored in the cache,
    // but attempts to retrieve data from the network if the main feature is not yet in the cache.
    const getAllFeatures = async (data: Data) => {
      const getter = get(dataAtoms.get);
      const getterAll = get(dataAtoms.getAll);
      const features = getter(data);
      const allFeatures = getterAll(data);
      if (features) return allFeatures.flat();

      await set(dataAtoms.setAndFetch, { data: data });
      return getterAll(data).flat();
    };

    // Used for a flow layer.
    // Retrieves and returns only a specific range of features from the cache.
    // If it is not stored in the cache, it attempts to retrieve the data from the network.
    const getFeatures = async (data: Data, range?: DataRange) => {
      const getter = get(dataAtoms.get);
      const c = getter(data, range);
      if (c) return c;

      await set(dataAtoms.setAndFetch, { data: data, range: range });
      return getter(data, range);
    };

    const result = await evalLayer(currentLayer, { getFeatures, getAllFeatures });
    set(layerStatus, "ready");
    set(computedFeatures, result ?? []);
  });

  const set = atom(null, async (_get, set, value: Layer | undefined) => {
    set(layer, value);
    await set(compute, undefined);
  });

  const writeFeatures = atom(null, async (get, set, value: Feature[]) => {
    const currentLayer = get(layer);
    if (!currentLayer?.data) return;

    set(dataAtoms.set, {
      data: currentLayer.data,
      features: value,
    });
    await set(compute, undefined);
  });

  return {
    get,
    set,
    writeFeatures,
  };
}
