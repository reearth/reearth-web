import { renderHook } from "@testing-library/react";

import { type Tile, useImageryProviders } from "./Imagery";

test("useImageryProviders", () => {
  const provider = jest.fn((url?: string): any => ({ hoge: url }));
  const { result, rerender } = renderHook(
    ({ tiles, cesiumIonAccessToken }: { tiles: Tile[]; cesiumIonAccessToken?: string }) =>
      useImageryProviders({
        tiles,
        presets: { default: provider },
        cesiumIonAccessToken,
      }),
    { initialProps: { tiles: [{ id: "1", tile_type: "default" }] } },
  );

  expect(result.current).toEqual({ "1": [undefined, { hoge: undefined }] });
  expect(provider).toBeCalledTimes(1);
  const prevImageryProvider = result.current["1"][1];

  rerender({ tiles: [{ id: "1", tile_type: "default" }] });

  expect(result.current).toEqual({ "1": [undefined, { hoge: undefined }] });
  expect(result.current["1"][1]).toBe(prevImageryProvider); // 1's provider should be reused
  expect(provider).toBeCalledTimes(1);

  rerender({ tiles: [{ id: "1", tile_type: "default", tile_url: "a" }] });

  expect(result.current).toEqual({ "1": ["a", { hoge: "a" }] });
  expect(result.current["1"][1]).not.toBe(prevImageryProvider);
  expect(provider).toBeCalledTimes(2);
  expect(provider).toBeCalledWith("a");
  const prevImageryProvider2 = result.current["1"][1];

  rerender({
    tiles: [
      { id: "2", tile_type: "default" },
      { id: "1", tile_type: "default", tile_url: "a" },
    ],
  });

  expect(result.current).toEqual({
    "2": [undefined, { hoge: undefined }],
    "1": ["a", { hoge: "a" }],
  });
  expect(result.current["1"][1]).toBe(prevImageryProvider2); // 1's provider should be reused
  expect(provider).toBeCalledTimes(3);

  rerender({
    tiles: [
      { id: "1", tile_type: "default", tile_url: "a" },
      { id: "2", tile_type: "default" },
    ],
  });

  expect(result.current).toEqual({
    "1": ["a", { hoge: "a" }],
    "2": [undefined, { hoge: undefined }],
  });
  expect(result.current["1"][1]).toBe(prevImageryProvider2); // 1's provider should be reused
  expect(provider).toBeCalledTimes(3);

  rerender({
    tiles: [{ id: "1", tile_type: "default", tile_url: "a" }],
    cesiumIonAccessToken: "a",
  });

  expect(result.current).toEqual({
    "1": ["a", { hoge: "a" }],
  });
  expect(result.current["1"][1]).not.toBe(prevImageryProvider2);
  expect(provider).toBeCalledTimes(4);

  rerender({ tiles: [] });
  expect(result.current).toEqual({});
});
