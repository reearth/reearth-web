import type { Data, DataLoader, DataRange } from "../types";

import GeoJSON from "./geojson";

const evaluators: Record<string, DataLoader> = {
  geojson: GeoJSON,
};

export default async function loadData(layer: Data, range?: DataRange): Promise<Data> {
  return evaluators[layer.type]?.(layer, range);
}
