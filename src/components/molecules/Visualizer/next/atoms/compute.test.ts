import { renderHook, act, waitFor } from "@testing-library/react";
import { useAtomValue, useSetAtom } from "jotai";
import { useMemo } from "react";
import { test, expect, vi } from "vitest";

import { fetchData } from "../data";
import { EvalContext, evalLayer } from "../evaluator";
import type { Data, DataRange, Feature, Layer } from "../types";

import { doubleKeyCacheAtom } from "./cache";
import { computeAtom } from "./compute";

const data: Data = { type: "geojson", url: "https://example.com/example.geojson" };
const range: DataRange = { x: 0, y: 0, z: 0 };
const layer: Layer = { id: "xxx", type: "simple", data };
const features: Feature[] = [{ id: "a", geometry: { type: "Point", coordinates: [0, 0] } }];

test("computeAtom", async () => {
  const { result } = renderHook(() => {
    const atoms = useMemo(() => computeAtom(doubleKeyCacheAtom<string, string, Feature[]>()), []);
    const result = useAtomValue(atoms.get);
    const set = useSetAtom(atoms.set);
    const writeFeatures = useSetAtom(atoms.writeFeatures);
    return { result, set, writeFeatures };
  });

  expect(result.current.result).toBeUndefined();

  act(() => {
    result.current.set(layer);
  });

  expect(result.current.result).toEqual({
    id: "xxx",
    layer,
    status: "fetching",
    features: [],
    originalFeatures: [],
  });

  await waitFor(() =>
    expect(result.current.result).toEqual({
      id: "xxx",
      layer,
      status: "ready",
      features,
      originalFeatures: features,
    }),
  );

  // reset a layer
  act(() => {
    result.current.set(layer);
  });

  expect(result.current.result).toEqual({
    id: "xxx",
    layer,
    status: "fetching",
    features,
    originalFeatures: features,
  });

  await waitFor(() => {
    expect(result.current.result).toEqual({
      id: "xxx",
      layer,
      status: "ready",
      features,
      originalFeatures: features,
    });
  });

  // write features
  act(() => {
    result.current.writeFeatures({ range, features });
  });

  expect(result.current.result).toEqual({
    id: "xxx",
    layer,
    status: "fetching",
    features,
    originalFeatures: [...features, ...features],
  });

  await waitFor(() =>
    expect(result.current.result).toEqual({
      id: "xxx",
      layer,
      status: "ready",
      features: [...features, ...features],
      originalFeatures: [...features, ...features],
    }),
  );

  // delete a layer
  act(() => {
    result.current.set(undefined);
  });

  expect(result.current.result).toBeUndefined();
});

vi.mock("../evaluator", (): { evalLayer: typeof evalLayer } => ({
  evalLayer: async (layer: Layer, ctx: EvalContext) => {
    if (!layer.data) return [];
    return ctx.getAllFeatures(layer.data);
  },
}));

vi.mock("../data", (): { fetchData: typeof fetchData } => ({
  fetchData: async () => features,
}));
