import { Cesium3DTileStyle } from "cesium";
import React, { useMemo } from "react";
import { Cesium3DTileset } from "resium";

import type { Props as PrimitiveProps } from "../../../Primitive";
import { shadowMode } from "../common";

export type Props = PrimitiveProps<Property>;

export type Property = {
  default?: {
    tileset?: string;
    styleUrl?: string;
    shadows?: "disabled" | "enabled" | "cast_only" | "receive_only";
  };
};

export default function Tiles({ primitive }: PrimitiveProps<Property>): JSX.Element | null {
  const { isVisible, property } = primitive ?? {};
  const { tileset, styleUrl, shadows } = (property as Property | undefined)?.default ?? {};
  const style = useMemo<Cesium3DTileStyle | undefined>(
    () => (styleUrl ? new Cesium3DTileStyle(styleUrl) : undefined),
    [styleUrl],
  );

  return !isVisible || !tileset ? null : (
    <Cesium3DTileset url={tileset} shadows={shadowMode(shadows)} style={style} />
  );
}
