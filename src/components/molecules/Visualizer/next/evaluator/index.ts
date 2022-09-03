import { Data, Feature, Layer } from "../types";

export async function evalLayer(
  layer: Layer,
  getData: (d: Data) => Promise<Feature[] | undefined>,
): Promise<Feature[] | undefined> {
  const features = layer.data ? getData(layer.data) : undefined;

  // eval

  return features;
}
