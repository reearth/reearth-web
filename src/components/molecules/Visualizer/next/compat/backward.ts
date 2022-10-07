import type { GeoJSON } from "geojson";
import { omit, omitBy, pick } from "lodash";

import { getCoord, getCoords, getGeom } from "@reearth/util/geojson";

import type { Layer, LayerCompat } from "../types";

import type { LegacyLayer } from ".";

export function convertLayer(l: Layer): LegacyLayer | undefined {
  return convertLayerGroup(l) ?? convertLayerItem(l);
}

function convertLayerCommon(l: Layer): any {
  return omitBy(
    {
      id: l.id,
      isVisible: l.visible,
      title: l.title,
      creator: l.creator,
      infobox: l.infobox,
      tags: l.tags,
      property: l.compat?.property,
      propertyId: l.compat?.propertyId,
      pluginId: l.compat?.extensionId ? "reearth" : undefined,
      extensionId: l.compat?.extensionId,
    },
    v => typeof v === "undefined" || v === null,
  );
}

function convertLayerGroup(l: Layer): LegacyLayer | undefined {
  if (l.type !== "group") return;
  return {
    type: "group",
    ...convertLayerCommon(l),
    children: l.children?.map(convertLayer).filter((l): l is LegacyLayer => !!l) ?? [],
  };
}

function convertLayerItem(l: Layer): LegacyLayer | undefined {
  if (l.type !== "simple") return;

  return {
    type: "item",
    ...convertLayerCommon(l),
  };
}

export function getCompat(l: Layer | undefined): LayerCompat | undefined {
  if (!l || typeof l !== "object" || l.type !== "simple") return;

  const data: GeoJSON | undefined = l.data?.type === "geojson" ? l.data.value : undefined;

  let property: any;
  let extensionId: string | undefined;

  if ("marker" in l) {
    const coord = getCoord(data);
    extensionId = "marker";
    property = {
      default: {
        ...l.marker,
        ...(coord && coord.length >= 2
          ? {
              location: { lng: coord[0], lat: coord[1] },
              height: coord[2],
            }
          : {}),
      },
    };
  } else if ("polyline" in l) {
    const coords = getCoords(data);
    extensionId = "polyline";
    property = {
      default: {
        ...(l as any).polyline,
        ...(coords
          ? {
              coordinates: coords.map(c => ({ lng: c[0], lat: c[1], height: c[2] })),
            }
          : {}),
      },
    };
  } else if ("polygon" in l) {
    // rect is also included in polygon
    const geo = getGeom(data);
    extensionId = "polygon";
    property = {
      default: {
        ...(l as any).polygon,
        ...(geo?.type === "Polygon"
          ? {
              polygon: geo.coordinates.map(coords =>
                coords.map(c => ({ lng: c[0], lat: c[1], height: c[2] })),
              ),
            }
          : {}),
      },
    };
  } else if ("legacy_photooverlay" in l) {
    extensionId = "photooverlay";
    property = {
      default: {
        ...(l as any).legacy_photooverlay,
      },
    };
  } else if ("ellipsoid" in l) {
    const coord = getCoord(data);
    extensionId = "ellipsoid";
    property = {
      default: {
        ...(l as any).ellipsoid,
        ...(coord && coord.length >= 2
          ? {
              position: { lng: coord[0], lat: coord[1] },
              height: coord[2],
            }
          : {}),
      },
    };
  } else if ("model" in l) {
    const appearanceKeys = [
      "shadows",
      "colorBlend",
      "color",
      "colorBlendAmount",
      "lightColor",
      "silhouette",
      "silhouetteColor",
      "silhouetteSize",
    ];
    const m = omit((l as any).model, ...appearanceKeys);
    const a = omitBy(
      pick((l as any).model, ...appearanceKeys),
      v => typeof v === "undefined" || v === null,
    );
    extensionId = "model";
    property = {
      default: {
        ...m,
        ...((l as any).data?.type === "gltf" && (l as any).data.url
          ? {
              url: (l as any).data.url,
            }
          : {}),
      },
      ...(Object.keys(a).length
        ? {
            appearance: a,
          }
        : {}),
    };
  } else if ("3dtiles" in l) {
    extensionId = "tileset";
    property = {
      default: {
        ...(l as any)["3dtiles"],
        ...((l as any).data?.type === "3dtiles" && (l as any).data.url
          ? {
              url: (l as any).data.url,
            }
          : {}),
      },
    };
  } else if ("legacy_resource" in l) {
    extensionId = "resource";
    property = {
      default: {
        ...(l as any).legacy_resource,
      },
    };
  }

  return {
    extensionId,
    property,
    ...(l.compat?.propertyId
      ? {
          propertyId: l.compat?.propertyId,
        }
      : {}),
  };
}
