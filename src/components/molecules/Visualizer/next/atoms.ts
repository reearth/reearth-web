import { atom } from "jotai";

import { fetchData } from "./data";
import { evalLayer } from "./evaluator";
import type { Layer, Feature, Data } from "./types";
import { cacheAtom } from "./utils";

const globalDataFeaturesCache = cacheAtom<Feature[]>();

export function layerAtom() {
  const layer = atom<Layer | undefined>(undefined);
  const featuresA = featuresAtom();
  const computedFeaturesA = computedFeaturesAtom();

  const getComputedLayer = atom(get => {
    const l = get(layer);
    if (!l) return undefined;

    const features = l.data ? get(featuresA.get)(l.data) : undefined;
    const computedFeatures = get(computedFeaturesA.get)(l);
    return {
      id: l.id,
      layer: l,
      features,
      computedFeatures,
    };
  });

  const writeLayer = atom(null, async (get, set, value: Layer | undefined) => {
    set(layer, value);
    set(writeFeatures, []);
  });

  const writeFeatures = atom(null, async (get, set, value: Feature[]) => {
    const l = get(layer);
    if (!l?.id) return;

    const getFeatures = async (d: Data) => {
      const c = get(featuresA.get)?.(d);
      if (c) return c;

      await set(featuresA.setAndFetchData, d);
      return get(featuresA.get)?.(d);
    };

    if (l.data) {
      set(featuresA.set, { key: l.data, features: value });
    }

    const features = await evalLayer(l, getFeatures);
    if (features) {
      set(computedFeaturesA.set, { key: l, features });
    }
  });

  return {
    getComputedLayer,
    writeLayer,
    writeFeatures,
  };
}

function featuresAtom([getCache, setCache] = globalDataFeaturesCache) {
  function key(data: Data): string {
    return `${data.type}::${data.url}`;
  }

  const setAndFetchData = atom(null, async (get, set, value: Data) => {
    const k = key(value);
    const cached = get(getCache)?.get(k);
    if (cached) return;

    const data = await fetchData(value);
    if (data) {
      set(setCache, { key: k, value: data });
    }
  });

  const get = atom(get => (data: Data) => get(getCache)?.get(key(data)));

  const set = atom(null, async (_get, set, value: { key: Data; features: Feature[] }) => {
    set(setCache, { key: key(value.key), value: value.features });
  });

  return {
    get,
    set,
    setAndFetchData,
  };
}

function computedFeaturesAtom([getCache, setCache] = globalDataFeaturesCache) {
  function key(layer: Layer): string {
    return layer.id;
  }

  const get = atom(get => (layer: Layer) => get(getCache)?.get(key(layer)));

  const set = atom(null, async (_get, set, value: { key: Layer; features: Feature[] }) => {
    set(setCache, { key: key(value.key), value: value.features });
  });

  return {
    get,
    set,
  };
}
