import {
  KmlDataSource as CesiumKmlDataSource,
  CzmlDataSource as CesiumCzmlDataSource,
  GeoJsonDataSource as CesiumGeoJsonDataSource,
} from "cesium";
import { useCallback, useMemo } from "react";
import { KmlDataSource, CzmlDataSource, GeoJsonDataSource } from "resium";

import { evalFeature } from "@reearth/core/mantle";

import type { ResourceAppearance, AppearanceTypes } from "../../..";
import { extractSimpleLayerData, type FeatureComponentConfig, type FeatureProps } from "../utils";

import { attachStyle } from "./utils";

export type Props = FeatureProps<Property>;
export type Property = ResourceAppearance;
const types: Record<string, "geojson" | "kml" | "czml"> = {
  kml: "kml",
  geojson: "geojson",
  czml: "czml",
};

const comps = {
  kml: KmlDataSource,
  czml: CzmlDataSource,
  geojson: GeoJsonDataSource,
};

const delegatingAppearance: Record<keyof typeof comps, (keyof AppearanceTypes)[]> = {
  kml: [],
  geojson: [],
  czml: ["marker", "polyline", "polygon"],
};

export default function Resource({ isVisible, property, layer }: Props) {
  const { clampToGround } = property ?? {};
  const [type, url] = useMemo((): [ResourceAppearance["type"], string | undefined] => {
    const data = extractSimpleLayerData(layer);
    const type = property?.type;
    const url = property?.url;
    return [type ?? (data?.type as ResourceAppearance["type"]), url ?? data?.url];
  }, [property, layer]);

  const ext = useMemo(
    () => (!type || type === "auto" ? url?.match(/\.([a-z]+?)(?:\?.*?)?$/) : undefined),
    [type, url],
  );
  const actualType = ext ? types[ext[1]] : type !== "auto" ? type : undefined;
  const Component = actualType ? comps[actualType] : undefined;
  const appearances = actualType ? delegatingAppearance[actualType] : undefined;

  const handleOnChange = useCallback(
    (e: CesiumCzmlDataSource | CesiumKmlDataSource | CesiumGeoJsonDataSource) => {
      attachStyle(e, appearances, layer, evalFeature);
    },
    [appearances, layer],
  );

  if (!isVisible || !Component || !url) return null;

  return (
    <Component data={url} show={true} clampToGround={clampToGround} onChange={handleOnChange} />
  );
}

export const config: FeatureComponentConfig = {
  noFeature: true,
};
