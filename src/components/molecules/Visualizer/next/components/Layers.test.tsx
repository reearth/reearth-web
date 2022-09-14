import { expect, test, vi } from "vitest";

import { render, screen } from "@reearth/test/utils";

import Component, { Layer, FeatureComponentProps } from "./Layers";

test("should work", () => {
  const Feature = vi.fn((_: FeatureComponentProps) => <div>Hello</div>);
  const layers: Layer[] = [
    { id: "a", type: "simple" },
    { id: "b", type: "simple" },
  ];
  const { rerender } = render(<Component layers={layers} Feature={Feature} />);

  expect(screen.getAllByText("Hello")[0]).toBeVisible();
  expect(screen.getAllByText("Hello")).toHaveLength(2);
  expect(Feature).toBeCalledTimes(2);
  expect(Feature.mock.calls[0][0]).toEqual({
    layer: {
      id: "a",
      features: [],
      layer: layers[0],
      status: "ready",
      originalFeatures: [],
    },
    onFeatureDelete: expect.any(Function),
    onFeatureFetch: expect.any(Function),
    onFeatureRequest: expect.any(Function),
  });
  expect(Feature.mock.calls[1][0]).toEqual({
    layer: {
      id: "b",
      features: [],
      layer: layers[1],
      status: "ready",
      originalFeatures: [],
    },
    onFeatureDelete: expect.any(Function),
    onFeatureFetch: expect.any(Function),
    onFeatureRequest: expect.any(Function),
  });

  Feature.mockClear();

  const layers2: Layer[] = [{ id: "c", type: "simple" }];
  rerender(<Component layers={layers2} Feature={Feature} />);
  expect(screen.getByText("Hello")).toBeVisible();
  expect(Feature.mock.calls[0][0].layer).toEqual({
    id: "c",
    features: [],
    layer: layers2[0],
    status: "ready",
    originalFeatures: [],
  });
});
