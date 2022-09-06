import type { GeoJSON } from "geojson";

import generateRandomString from "@reearth/util/generate-random-string";

import type { Data, DataRange, Feature } from "../types";

export async function fetchData(data: Data, range?: DataRange): Promise<Feature[] | void> {
  if (data.type === "geojson") {
    const res = await fetch(data.url);
    if (res.status !== 200) {
      throw new Error(`fetched ${data.url} but status code was ${res.status}`);
    }
    const geojson: GeoJSON = await res.json();
    return processGeoJSON(geojson, range);
  }
}

function processGeoJSON(geojson: GeoJSON, range?: DataRange): Feature[] {
  if (geojson.type === "FeatureCollection") {
    return geojson.features.flatMap(f => processGeoJSON(f, range));
  }

  if (geojson.type === "Feature") {
    return [
      {
        id: (geojson.id && String(geojson.id)) || generateRandomString(12),
        geometry: geojson.geometry,
        properties: geojson.properties,
        range,
      },
    ];
  }

  return [];
}
