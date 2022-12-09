import { useMemo } from "react";
import { KmlDataSource, CzmlDataSource, GeoJsonDataSource } from "resium";

import { type FeatureComponentConfig, type FeatureProps } from "../utils";

export type Props = FeatureProps<Property>;

export type Property = {
  url?: string;
  type?: Type | "auto";
  clampToGround?: boolean;
};

type Type = "geojson" | "kml" | "czml";

const types: Record<string, Type> = {
  kml: "kml",
  geojson: "geojson",
  czml: "czml",
};

const comps = {
  kml: KmlDataSource,
  czml: CzmlDataSource,
  geojson: GeoJsonDataSource,
};

export default function Resource({ isVisible, property }: Props) {
  const { url, type, clampToGround } = property ?? {};
  const ext = useMemo(
    () => (!type || type === "auto" ? url?.match(/\.([a-z]+?)(?:\?.*?)?$/) : undefined),
    [type, url],
  );
  const actualType = ext ? types[ext[1]] : type !== "auto" ? type : undefined;
  const Component = actualType ? comps[actualType] : undefined;

  if (!isVisible || !Component || !url) return null;

  return <Component data={url} clampToGround={clampToGround} />;
}

export const config: FeatureComponentConfig = {};