import { renderHook, act, waitFor } from "@testing-library/react";
import { useAtomValue, useSetAtom } from "jotai";
import { useMemo } from "react";
import { test, expect, vi } from "vitest";

import { fetchData } from "../data";
import type { Data, DataRange, Feature } from "../types";

import { doubleKeyCacheAtom } from "./cache";
import { dataAtom } from "./data";

const data: Data = { type: "geojson", url: "https://example.com/example.geojson" };
const range: DataRange = { x: 0, y: 0, z: 0 };
const features: Feature[] = [{ id: "a", geometry: { type: "Point", coordinates: [0, 0] } }];
const features2: Feature[] = [{ id: "a", geometry: { type: "Point", coordinates: [0, 0] }, range }];
const features3: Feature[] = [
  { id: "a", geometry: { type: "Point", coordinates: [0, 0] }, range },
  { id: "b", geometry: { type: "Point", coordinates: [0, 0] }, range },
  { id: "c", geometry: { type: "Point", coordinates: [0, 0] }, range },
];

test("dataAtom set", () => {
  const { result } = renderHook(() => {
    const atoms = useMemo(() => dataAtom(doubleKeyCacheAtom<string, string, Feature[]>()), []);
    const get = useAtomValue(atoms.get);
    const getAll = useAtomValue(atoms.getAll);
    const set = useSetAtom(atoms.set);
    return { get, set, getAll };
  });

  expect(result.current.get(data)).toBeUndefined();

  act(() => {
    result.current.set({ data, features });
  });

  expect(result.current.get(data)).toEqual(features);
  expect(result.current.getAll(data)).toEqual([features]);
  expect(result.current.get(data, range)).toBeUndefined();

  act(() => {
    result.current.set({ data, features: features2 });
  });

  expect(result.current.get(data, range)).toEqual(features2);
  expect(result.current.getAll(data)).toEqual([features, features2]);
});

test("dataAtom setAndFetch", async () => {
  const { result } = renderHook(() => {
    const atoms = useMemo(() => dataAtom(doubleKeyCacheAtom<string, string, Feature[]>()), []);
    const get = useAtomValue(atoms.get);
    const getAll = useAtomValue(atoms.getAll);
    const setAndFetch = useSetAtom(atoms.setAndFetch);
    return { get, setAndFetch, getAll };
  });

  expect(result.current.get(data)).toBeUndefined();
  expect(result.current.getAll(data)).toEqual([]);

  act(() => {
    result.current.setAndFetch({ data });
  });

  await waitFor(() => expect(result.current.get(data)).toEqual(features));
  expect(result.current.get(data, range)).toBeUndefined();
  expect(result.current.getAll(data)).toEqual([features]);
});

test("dataAtom deleteAll", async () => {
  const { result } = renderHook(() => {
    const atoms = useMemo(() => dataAtom(doubleKeyCacheAtom<string, string, Feature[]>()), []);
    const get = useAtomValue(atoms.get);
    const getAll = useAtomValue(atoms.getAll);
    const set = useSetAtom(atoms.set);
    const deleteAll = useSetAtom(atoms.deleteAll);
    return { get, getAll, set, deleteAll };
  });

  act(() => {
    result.current.set({ data, features: features3 });
  });

  await waitFor(() => expect(result.current.get(data, range)).toEqual(features3));

  act(() => {
    result.current.deleteAll({ data, features: ["b"] });
  });

  await waitFor(() =>
    expect(result.current.get(data, range)).toEqual([features3[0], features3[2]]),
  );
});

vi.mock("../data", (): { fetchData: typeof fetchData } => ({
  fetchData: async () => features,
}));
