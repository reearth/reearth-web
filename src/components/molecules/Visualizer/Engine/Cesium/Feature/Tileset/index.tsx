import { Cesium3DTileset as Cesium3DTilesetType, Cesium3DTileStyle, IonResource } from "cesium";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Cesium3DTileset, CesiumComponentRef } from "resium";

import type { Props as PrimitiveProps } from "../../../../Layers/Primitive";
import { shadowMode } from "../../common";
import { attachTag } from "../utils";

export type Props = PrimitiveProps<Property>;

export type Property = {
  sourceType?: "url" | "osm";
  tileset?: string;
  styleUrl?: string;
  shadows?: "disabled" | "enabled" | "cast_only" | "receive_only";
};

export default function Tileset({
  id,
  isVisible,
  property,
  layer,
  feature,
}: PrimitiveProps<Property>): JSX.Element | null {
  const { sourceType, tileset, styleUrl, shadows } = property ?? {};
  const [style, setStyle] = useState<Cesium3DTileStyle>();

  const ref = useCallback(
    (tileset: CesiumComponentRef<Cesium3DTilesetType> | null) => {
      if (tileset?.cesiumElement) {
        attachTag(tileset.cesiumElement, { layerId: layer?.id || id, featureId: feature?.id });
      }
    },
    [feature?.id, id, layer?.id],
  );

  useEffect(() => {
    if (!styleUrl) {
      setStyle(undefined);
      return;
    }
    (async () => {
      const res = await fetch(styleUrl);
      if (!res.ok) return;
      setStyle(new Cesium3DTileStyle(await res.json()));
    })();
  }, [styleUrl]);

  const tilesetUrl = useMemo(() => {
    return sourceType === "osm" && isVisible
      ? IonResource.fromAssetId(96188) // https://github.com/CesiumGS/cesium/blob/1.69/Source/Scene/createOsmBuildings.js#L50
      : isVisible
      ? tileset
      : null;
  }, [isVisible, sourceType, tileset]);

  return !isVisible || (!tileset && !sourceType) || !tilesetUrl ? null : (
    <Cesium3DTileset ref={ref} url={tilesetUrl} style={style} shadows={shadowMode(shadows)} />
  );
}
