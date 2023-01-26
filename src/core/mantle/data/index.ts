import type { Data, DataRange, Feature } from "../types";

import { fetchCSV } from "./csv";
import { fetchGeoJSON } from "./geojson";
import { fetchGTFS } from "./gtfs";

const registry: Record<
  string,
  (data: Data, callback: (result: Feature[] | void) => void, range?: DataRange) => void
> = {
  geojson: fetchGeoJSON,
  csv: fetchCSV,
  gtfs: fetchGTFS,
};

export async function fetchData(
  data: Data,
  callback: (result: Feature[] | void) => void,
  range?: DataRange,
): Promise<void> {
  registry[data.type]?.(data, callback, range);
}
