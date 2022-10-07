import { Feature, LineString, Point, Polygon } from "geojson";
import { omitBy } from "lodash";

import type { Data, Layer, LayerGroup, LayerSimple } from "../types";

import type { LegacyLayer } from ".";

export function convertLegacyLayer(l: LegacyLayer): Layer | undefined {
  return convertLegacyLayerGroup(l) ?? convertLegacyLayerItem(l);
}

function convertLegacyLayerCommon(l: LegacyLayer): any {
  const compat = omitBy(
    {
      extensionId: l.extensionId,
      property: l.property,
      propertyId: l.propertyId,
    },
    v => typeof v === "undefined" || v === null,
  );

  return omitBy(
    {
      id: l.id,
      title: l.title,
      hidden: !l.isVisible,
      creator: l.creator,
      infobox: l.infobox,
      tags: l.tags,
      ...(Object.keys(compat).length ? { compat } : {}),
    },
    v => typeof v === "undefined" || v === null,
  );
}

function convertLegacyLayerGroup(l: LegacyLayer): LayerGroup | undefined {
  if (l.type !== "group") return;
  return {
    type: "group",
    ...convertLegacyLayerCommon(l),
    children: l.children?.map(convertLegacyLayer).filter((l): l is Layer => !!l) ?? [],
  };
}

function convertLegacyLayerItem(l: LegacyLayer): LayerSimple | undefined {
  if (l.type !== "item") return;

  let appearance: string | undefined;
  let data: Data | undefined;
  let legacyPropertyKeys: string[] | undefined;

  if (l.extensionId === "marker") {
    appearance = "marker";
    legacyPropertyKeys = ["location", "height"];
    if (l.property?.default?.location) {
      data = {
        type: "geojson",
        value: {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [
              l.property.default.location.lng,
              l.property.default.location.lat,
              ...(l.property.default.height ? [l.property.default.height] : []),
            ],
          },
        } as Feature<Point>,
      };
    }
  } else if (l.extensionId === "polyline") {
    appearance = "polyline";
    legacyPropertyKeys = ["coordinates"];
    if (l.property?.default?.coordinates) {
      data = {
        type: "geojson",
        value: {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: l.property.default.coordinates.map((c: any) => [c.lng, c.lat, c.height]),
          },
        } as Feature<LineString>,
      };
    }
  } else if (l.extensionId === "polygon") {
    appearance = "polygon";
    legacyPropertyKeys = ["polygon"];
    if (l.property?.default?.polygon) {
      data = {
        type: "geojson",
        value: {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: l.property.default.polygon.map((p: any) =>
              p.map((c: any) => [c.lng, c.lat, c.height]),
            ),
          },
        } as Feature<Polygon>,
      };
    }
  } else if (l.extensionId === "rect") {
    appearance = "polygon";
    legacyPropertyKeys = ["rect", "height"];
    if (l.property?.default?.rect) {
      const r = l.property?.default?.rect;
      const h = l.property.default.height;
      data = {
        type: "geojson",
        value: {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [r.west, r.north, h],
                [r.east, r.north, h],
                [r.east, r.south, h],
                [r.west, r.south, h],
                [r.west, r.north, h],
              ],
            ],
          },
        } as Feature<Polygon>,
      };
    }
  } else if (l.extensionId === "photooverlay") {
    appearance = "legacy_photooverlay";
  } else if (l.extensionId === "ellipsoid") {
    appearance = "ellipsoid";
    legacyPropertyKeys = ["position", "height"];
    if (l.property?.default?.position) {
      data = {
        type: "geojson",
        value: {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [
              l.property.default.position.lng,
              l.property.default.position.lat,
              ...(typeof l.property.default.height === "number" ? [l.property.default.height] : []),
            ],
          },
        } as Feature<Point>,
      };
    }
  } else if (l.extensionId === "model") {
    appearance = "model";
    legacyPropertyKeys = ["url"];
    if (l.property?.default?.url) {
      data = {
        type: "gltf",
        url: l.property.default.url,
      };
    }
  } else if (l.extensionId === "tileset") {
    appearance = "3dtiles";
    legacyPropertyKeys = ["url"];
    if (l.property?.default?.url) {
      data = {
        type: "3dtiles",
        url: l.property.default.url,
      };
    }
  } else if (l.extensionId === "resource") {
    appearance = "legacy_resource";
  }

  const property = appearance
    ? Object.fromEntries(
        Object.entries(l.property)
          .flatMap(([k, v]): (readonly [PropertyKey, any])[] | undefined => {
            if (Array.isArray(v) || k === "id" || !v || typeof v !== "object") return undefined;
            return Object.entries(v).filter(([k]) => !legacyPropertyKeys?.includes(k));
          })
          .filter((p): p is readonly [PropertyKey, any] => !!p),
      )
    : undefined;

  return {
    type: "simple",
    ...convertLegacyLayerCommon(l),
    data,
    ...(appearance && property ? { [appearance]: property } : {}),
  };
}
