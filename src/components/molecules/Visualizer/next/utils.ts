import { atom } from "jotai";

import type { TreeLayer, Layer } from "./types";

export function flattenLayers(layers: TreeLayer[] | undefined): Layer[] | undefined {
  return layers?.flatMap(l => ("children" in l ? flattenLayers(l.children) ?? [] : [l]));
}

export function cacheAtom<T>() {
  const map = atom<Map<string, T> | undefined>(undefined);
  const get = atom(get => get(map));
  const set = atom(null, (get, set, value: { key: string; value?: T }) => {
    const m = get(map) ?? new Map();
    if (typeof value.value === "undefined") {
      m.delete(value.key);
    } else {
      m.set(value.key, value.value);
    }
    set(map, m);
  });

  return [get, set] as const;
}
