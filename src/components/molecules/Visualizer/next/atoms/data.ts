import { atom } from "jotai";
import { groupBy, remove } from "lodash";

import { fetchData } from "../data";
import type { Feature, Data, DataRange } from "../types";

import { doubleKeyCacheAtom } from "./cache";

export const globalDataFeaturesCache = doubleKeyCacheAtom<string, string, Feature[]>();

export function dataAtom(cacheAtoms = globalDataFeaturesCache) {
  const fetching = atom<[string, string][]>([]);

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

  const deleteAll = atom(null, async (get, set, value: { data: Data; features: string[] }) => {
    const d = dataKey(value.data);
    Object.entries(
      groupBy(
        get(getAll)(value.data)
          ?.filter(f => f.length)
          .map(
            f => [rangeKey(f[0].range), f, f.filter(g => !value.features.includes(g.id))] as const,
          )
          .filter(f => f[1].length !== f[2].length),
        g => g[0],
      ),
    ).forEach(([k, f]) => {
      set(cacheAtoms.set, {
        key: d,
        key2: k,
        value: f.flatMap(g => g[2]),
      });
    });
  });

  const fetch = atom(null, async (get, set, value: { data: Data; range?: DataRange }) => {
    const k = dataKey(value.data, value.range);
    const rk = rangeKey(value.range);
    const cached = get(cacheAtoms.get)(k, rk);
    if (cached || get(fetching).findIndex(e => e[0] === k && e[1] === rk) >= 0) return;

    set(fetching, f => [...f, [k, rk]]);

    const data = await fetchData(value.data, value.range);
    if (data) {
      set(cacheAtoms.set, { key: k, key2: rk, value: data });
    }

    set(fetching, f => remove(f, e => e[0] === k && e[1] === rk));
  });

  return {
    get,
    getAll,
    set,
    fetch,
    deleteAll,
  };
}

function dataKey(data: Data, range?: DataRange): string {
  return `${data.type}::${data.url}${range ? `${range.x}:${range.y}:${range.z}` : ""}`;
}

function rangeKey(range?: DataRange): string {
  return range ? `${range.x}:${range.y}:${range.z}` : "";
}
