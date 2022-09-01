import { atom } from "jotai";
import { atomFamily } from "jotai/utils";

import { fetchData } from "./data";
import type { Layer, Feature, Data } from "./types";

const globalDataCache = dataCacheAtom();

export function layerAtom() {
  const layer = atom<Layer | undefined>(undefined);
  const data = dataAtom();

  const features = atom(get => {
    const l = get(layer);
    if (!l?.data) return;
    return get(data.getter)?.get(dataKey(l.data));
  });

  const writeLayer = atom(null, (_get, set, value: Layer | undefined) => {
    set(layer, value);
    if (value?.data) {
      set(data.fetch, value.data);
    }
  });

  return {
    features,
    writeLayer,
    writeFeatures: data.write,
  };
}

function dataAtom({ map, cache } = globalDataCache) {
  const fetch = atom(null, async (get, set, value: Data) => {
    const key = dataKey(value);
    const a = cache(key);
    const cached = get(a);
    if (cached) return;

    const data = await fetchData(value);
    if (data) {
      set(a, data);
    }
  });

  const write = atom(null, async (get, set, value: { key: string; features: Feature[] }) => {
    set(cache(value.key), value.features);
  });

  return {
    getter: map,
    write,
    fetch,
  };
}

function dataCacheAtom() {
  const map = atom<Map<string, Feature[]> | undefined>(undefined);
  const cache = atomFamily((key: string) =>
    atom(
      get => get(map)?.get(key),
      (get, set, value: Feature[]) => {
        const m = get(map) ?? new Map();
        if (!value) {
          m.delete(key);
        } else {
          m.set(key, value);
        }
        set(map, m);
      },
    ),
  );

  const getter = atom(get => get(map));

  return { map: getter, cache };
}

function dataKey(data: Data): string {
  return `${data.type}::${data.url}`;
}
