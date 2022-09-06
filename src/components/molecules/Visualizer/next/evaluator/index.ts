import { Data, DataRange, Feature, Layer } from "../types";

export type EvalContext = {
  getFeatures: (d: Data, r?: DataRange) => Promise<Feature[] | undefined>;
  getAllFeatures: (d: Data) => Promise<Feature[] | undefined>;
};

export async function evalLayer(layer: Layer, ctx: EvalContext): Promise<Feature[] | void> {
  if (layer.type === "simple") {
    return evalSimpleLayer(layer, ctx);
  }
}

export async function evalSimpleLayer(
  layer: Layer,
  ctx: EvalContext,
): Promise<Feature[] | undefined> {
  const features = layer.data ? ctx.getAllFeatures(layer.data) : undefined;

  // eval

  return features;
}
