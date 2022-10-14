import { atom } from "jotai";
import { merge, pick } from "lodash";

import { evalLayer } from "../evaluator";
import type { ComputedLayer, ComputedLayerStatus, Data, DataRange, Feature, Layer } from "../types";
import { appearanceKeys } from "../types";

import { dataAtom, globalDataFeaturesCache } from "./data";

export type Atom = ReturnType<typeof computeAtom>;

export type Command =
  | { type: "setLayer"; layer?: Layer }
  | { type: "requestFetch"; range: DataRange }
  | { type: "writeFeatures"; features: Feature[] }
  | { type: "deleteFeatures"; features: string[] }
  | { type: "override"; overrides?: Record<string, any> };

export function computeAtom(cache?: typeof globalDataFeaturesCache) {
  const layer = atom<Layer | undefined>(undefined);
  const overrides = atom<Record<string, any> | undefined, Record<string, any> | undefined>(
    undefined,
    (_, set, value) => {
      set(overrides, pick(value, appearanceKeys));
    },
  );

  const computedFeatures = atom<Feature[]>([]);
  const finalFeatures = atom(get =>
    get(computedFeatures).map(f => merge({ ...f }, get(overrides))),
  );
  const layerStatus = atom<ComputedLayerStatus>("fetching");
  const dataAtoms = dataAtom(cache);

  const get = atom((get): ComputedLayer | undefined => {
    const currentLayer = get(layer);
    if (!currentLayer) return;

    return {
      id: currentLayer.id,
      layer: currentLayer,
      status: get(layerStatus),
      features: get(finalFeatures),
      originalFeatures:
        currentLayer.type === "simple" && currentLayer.data
          ? get(dataAtoms.getAll)(currentLayer.data).flat()
          : [],
    };
  });

  const compute = atom(null, async (get, set, _: any) => {
    const currentLayer = get(layer);
    if (!currentLayer) return;

    if (currentLayer.type !== "simple" || !currentLayer.data) {
      set(layerStatus, "ready");
      return;
    }

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

      await set(dataAtoms.fetch, { data: data });
      return getterAll(data).flat();
    };

    // Used for a flow layer.
    // Retrieves and returns only a specific range of features from the cache.
    // If it is not stored in the cache, it attempts to retrieve the data from the network.
    const getFeatures = async (data: Data, range?: DataRange) => {
      const getter = get(dataAtoms.get);
      const c = getter(data, range);
      if (c) return c;

      await set(dataAtoms.fetch, { data, range });
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

  const requestFetch = atom(null, async (get, set, value: DataRange) => {
    const l = get(layer);
    if (l?.type !== "simple" || !l.data) return;

    await set(dataAtoms.fetch, { data: l.data, range: value });
  });

  const writeFeatures = atom(null, async (get, set, value: Feature[]) => {
    const currentLayer = get(layer);
    if (currentLayer?.type !== "simple" || !currentLayer.data) return;

    set(dataAtoms.set, {
      data: currentLayer.data,
      features: value,
    });
    await set(compute, undefined);
  });

  const deleteFeatures = atom(null, async (get, set, value: string[]) => {
    const currentLayer = get(layer);
    if (currentLayer?.type !== "simple" || !currentLayer?.data) return;

    set(dataAtoms.deleteAll, {
      data: currentLayer.data,
      features: value,
    });
    await set(compute, undefined);
  });

  return atom<ComputedLayer | undefined, Command>(
    g => g(get),
    async (_, s, value) => {
      switch (value.type) {
        case "setLayer":
          await s(set, value.layer);
          break;
        case "requestFetch":
          await s(requestFetch, value.range);
          break;
        case "writeFeatures":
          await s(writeFeatures, value.features);
          break;
        case "deleteFeatures":
          await s(deleteFeatures, value.features);
          break;
        case "override":
          await s(overrides, value.overrides);
          break;
      }
    },
  );
}
