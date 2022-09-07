import { atom } from "jotai";
import { groupBy } from "lodash";

import { fetchData } from "../data";
import type { Feature, Data, DataRange } from "../types";

import { doubleKeyCacheAtom } from "./cache";

export const globalDataFeaturesCache = doubleKeyCacheAtom<string, string, Feature[]>();

export function dataAtom(cacheAtoms = globalDataFeaturesCache) {
  const get = atom(
    get => (data: Data, range?: DataRange) => get(cacheAtoms.get)(dataKey(data), rangeKey(range)),
  );

  const getAll = atom(get => (data: Data) => get(cacheAtoms.getAll)(dataKey(data)));

  const set = atom(null, async (_get, set, value: { data: Data; features: Feature[] }) => {
    Object.entries(groupBy(value.features, f => rangeKey(f.range))).forEach(([k, v]) => {
      set(cacheAtoms.set, {
        key: dataKey(value.data),
        key2: k,
        value: v,
      });
    });
  });

  const setAndFetch = atom(null, async (get, set, value: { data: Data; range?: DataRange }) => {
    const k = dataKey(value.data, value.range);
    const rk = rangeKey(value.range);
    const cached = get(cacheAtoms.get)(k, rk);
    if (cached) return;

    const data = await fetchData(value.data, value.range);
    if (data) {
      set(cacheAtoms.set, { key: k, key2: rk, value: data });
    }
  });

  return {
    get,
    getAll,
    set,
    setAndFetch,
  };
}

function dataKey(data: Data, range?: DataRange): string {
  return `${data.type}::${data.url}${range ? `${range.x}:${range.y}:${range.z}` : ""}`;
}

function rangeKey(range?: DataRange): string {
  return range ? `${range.x}:${range.y}:${range.z}` : "";
}
