import { atom } from "jotai";

import { fetchData } from "./data";
import type { Layer, Feature, Data } from "./types";
import { cacheAtom } from "./utils";

const globalFeatureCache = cacheAtom<Feature[]>();

export function layerAtom() {
  const layer = atom<Layer | undefined>(undefined);
  const data = dataAtom();

  const features = atom(get => {
    const l = get(layer);
    if (!l?.data) return;
    return get(data.getFeatures)?.get(dataKey(l.data));
  });

  const writeLayer = atom(null, (_get, set, value: Layer | undefined) => {
    set(layer, value);
    if (value?.data) {
      set(data.setAndFetchData, value.data);
    }
  });

  return {
    features,
    writeLayer,
    writeFeatures: data.setFeatures,
  };
}

function dataAtom([getCache, setCache] = globalFeatureCache) {
  const setAndFetchData = atom(null, async (get, set, value: Data) => {
    const key = dataKey(value);
    const cached = get(getCache)?.get(key);
    if (cached) return;

    const data = await fetchData(value);
    if (data) {
      set(setCache, { key, value: data });
    }
  });

  const setFeatures = atom(null, async (_get, set, value: { key: string; features: Feature[] }) => {
    set(setCache, { key: value.key, value: value.features });
  });

  return {
    getFeatures: getCache,
    setFeatures,
    setAndFetchData,
  };
}

function dataKey(data: Data): string {
  return `${data.type}::${data.url}`;
}
