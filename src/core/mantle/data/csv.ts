import type { Feature as GeoJsonFeature } from "geojson";

import type { Data, DataRange, Feature } from "../types";

import { f, generateRandomString } from "./utils";

export async function fetchCSV(data: Data, range?: DataRange): Promise<Feature[] | void> {
  if (!data.url) {
    const value = data.value;
    const feature = makeFeature(value, range);
    return feature ? [feature] : undefined;
  }
  const csvText = await (await f(data.url)).text();
  return await parseCSV(csvText, data.csv, range);
}

const parseCSV = async (
  text: string,
  options: Data["csv"],
  range: DataRange | undefined,
): Promise<Feature[] | void> => {
  const { parse } = await import("csv-parse");
  return new Promise((resolve, reject) => {
    const result: Feature[] = [];

    const parser = parse({
      // Referring this specification https://csv-spec.org/.
      delimiter: [",", ";", "\t"],
    });

    let headerKeys: string[] | undefined;

    // Use the readable stream api to consume records
    parser.on("readable", () => {
      let record;
      while ((record = parser.read()) !== null) {
        if (!headerKeys) {
          if (!options?.noHeader) {
            headerKeys = record;
            continue;
          }
          headerKeys = [];
        }
        const value = makeGeoJsonFromArray(headerKeys, record, options);
        const feature = makeFeature(value, range);
        if (feature) {
          result.push(feature);
        }
      }
    });

    // Catch any error
    parser.on("error", err => {
      reject(`${err.name} is occurred while parsing CSV: ${err.message}`);
    });

    parser.on("end", () => {
      resolve(result);
    });

    parser.write(text);

    parser.end();
  });
};

const makeGeoJsonFromArray = (
  headers: string[],
  values: string[],
  options: Data["csv"],
): GeoJsonFeature =>
  values.reduce(
    (result, value, idx) => {
      if (options?.idColumn !== undefined && [headers[idx], idx].includes(options.idColumn)) {
        return {
          ...result,
          id: value,
        };
      }

      if (options?.latColumn !== undefined && [headers[idx], idx].includes(options.latColumn)) {
        const geometry = {
          ...result.geometry,
          coordinates: [Number(value), result.geometry.coordinates[1]],
        };
        return {
          ...result,
          geometry,
        };
      }
      if (options?.lngColumn !== undefined && [headers[idx], idx].includes(options.lngColumn)) {
        const geometry = {
          ...result.geometry,
          coordinates: [result.geometry.coordinates[0], Number(value)],
        };
        return {
          ...result,
          geometry,
        };
      }

      return {
        ...result,
        properties: {
          ...result.properties,
          ...(headers[idx] ? { [headers[idx]]: value } : {}),
        },
      };
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: new Array(2),
      },
      properties: {},
    },
  );

const makeFeature = (value: GeoJsonFeature, range: DataRange | undefined): Feature | void => {
  if (value.type !== "Feature") {
    return;
  }

  const geo = value.geometry;
  return {
    id: (value.id && String(value.id)) || generateRandomString(12),
    geometry:
      geo.type === "Point" || geo.type === "LineString" || geo.type === "Polygon" ? geo : undefined,
    properties: value.properties,
    range,
  };
};
