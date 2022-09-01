import type { GeoJSON } from "geojson";

import generateRandomString from "@reearth/util/generate-random-string";

import type { Data, Feature } from "../types";

export async function fetchData(data: Data): Promise<Feature[] | void> {
  if (data.type === "geojson") {
    const res = await fetch(data.url);
    if (res.status !== 200) {
      throw new Error(`fetched ${data.url} but status code was ${res.status}`);
    }
    const geojson: GeoJSON = await res.json();
    return processGeoJSON(geojson);
  }
}

function processGeoJSON(geojson: GeoJSON): Feature[] {
  if (geojson.type === "FeatureCollection") {
    return geojson.features.flatMap(processGeoJSON);
  }

  if (geojson.type === "Feature") {
    return [
      {
        id: (geojson.id && String(geojson.id)) || generateRandomString(12),
        geometry: geojson.geometry,
        properties: geojson.properties,
      },
    ];
  }

  return [];
}
