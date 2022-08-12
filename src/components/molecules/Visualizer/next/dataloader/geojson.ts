import type { Data, DataSource } from "../types";

export default async function geojson(source: DataSource): Promise<Data> {
  const _json = await (await fetch(source.url)).json();

  // convert json to data

  throw new Error("wip");
}
