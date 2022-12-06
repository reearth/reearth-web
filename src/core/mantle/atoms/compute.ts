import { atom } from "jotai";
import { merge, pick } from "lodash-es";

import { evalLayer, EvalResult } from "../evaluator";
import type {
  ComputedFeature,
  ComputedLayer,
  ComputedLayerStatus,
  Data,
  DataRange,
  Feature,
  Layer,
} from "../types";
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

  const computedResult = atom<EvalResult | undefined>(undefined);
  const finalFeatures = atom(get =>
    get(computedResult)?.features?.map((f): ComputedFeature => merge({ ...f }, get(overrides))),
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
      features: get(finalFeatures) ?? [],
      originalFeatures:
        currentLayer.type === "simple" && currentLayer.data
          ? get(dataAtoms.getAll)(currentLayer.id, currentLayer.data)?.flat() ?? []
          : [],
      ...get(computedResult)?.layer,
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

    const layerId = currentLayer.id;

    // Used for a simple layer.
    // It retrieves all features for the layer stored in the cache,
    // but attempts to retrieve data from the network if the main feature is not yet in the cache.
    const getAllFeatures = async (data: Data) => {
      const getterAll = get(dataAtoms.getAll);

      // Ignore cache if data is embedded
      if (!data.value) {
        const allFeatures = getterAll(layerId, data);
        if (allFeatures) return allFeatures.flat();
      }

      await set(dataAtoms.fetch, { data, layerId });
      return getterAll(layerId, data)?.flat() ?? [];
    };

    // Used for a flow layer.
    // Retrieves and returns only a specific range of features from the cache.
    // If it is not stored in the cache, it attempts to retrieve the data from the network.
    const getFeatures = async (data: Data, range?: DataRange) => {
      const getter = get(dataAtoms.get);

      // Ignore cache if data is embedded
      if (!data.value) {
        const c = getter(layerId, data, range);
        if (c) return c;
      }

      await set(dataAtoms.fetch, { data, range, layerId });
      return getter(layerId, data, range);
    };

    const result = await evalLayer(currentLayer, { getFeatures, getAllFeatures });
    set(layerStatus, "ready");
    set(computedResult, result);
  });

  const set = atom(null, async (_get, set, value: Layer | undefined) => {
    set(layer, value);
    await set(compute, undefined);
  });

  const requestFetch = atom(null, async (get, set, value: DataRange) => {
    const currentLayer = get(layer);
    if (currentLayer?.type !== "simple" || !currentLayer.data) return;

    await set(dataAtoms.fetch, { data: currentLayer.data, range: value, layerId: currentLayer.id });
  });

  const writeFeatures = atom(null, async (get, set, value: Feature[]) => {
    const currentLayer = get(layer);
    if (currentLayer?.type !== "simple" || !currentLayer.data) return;

    set(dataAtoms.set, {
      data: currentLayer.data,
      features: value,
      layerId: currentLayer.id,
    });
    await set(compute, undefined);
  });

  const deleteFeatures = atom(null, async (get, set, value: string[]) => {
    const currentLayer = get(layer);
    if (currentLayer?.type !== "simple" || !currentLayer?.data) return;

    set(dataAtoms.deleteAll, {
      data: currentLayer.data,
      features: value,
      layerId: currentLayer.id,
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
