import { ShadowMode } from "cesium";
import React from "react";
import { Cesium3DTileset } from "resium";

import type { Props as PrimitiveProps } from "../../../Primitive";

export type Props = PrimitiveProps<Property>;

export type Property = {
  default?: {
    tileset?: string;
    shadow?: "disabled" | "enabled" | "cast_only" | "receive_only";
  };
};

export default function Tiles({ primitive }: PrimitiveProps<Property>): JSX.Element | null {
  const { isVisible, property } = primitive ?? {};
  const { tileset, shadow } = (property as Property | undefined)?.default ?? {};
  const shadows = shadow
    ? (
        {
          enabled: ShadowMode.ENABLED,
          cast_only: ShadowMode.CAST_ONLY,
          receive_only: ShadowMode.RECEIVE_ONLY,
        } as { [key in string]?: ShadowMode }
      )[shadow]
    : undefined;

  return !isVisible || !tileset ? null : <Cesium3DTileset url={tileset} shadows={shadows} />;
}
