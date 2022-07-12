import { ImageryProvider } from "cesium";
import { useCallback, useMemo, useRef } from "react";
import { ImageryLayer } from "resium";

import { tiles as tilePresets } from "./presets";

export type ImageryLayerData = {
  id: string;
  provider: ImageryProvider;
  min?: number;
  max?: number;
  opacity?: number;
};

export type Tile = {
  id: string;
  tile_url?: string;
  tile_type?: string;
  tile_opacity?: number;
  tile_minLevel?: number;
  tile_maxLevel?: number;
};

export type Props = {
  tiles?: Tile[];
  cesiumIonAccessToken?: string;
};

export default function ImargeryLayers({ tiles, cesiumIonAccessToken }: Props) {
  const providers = useImageryProviders({
    tiles,
    cesiumIonAccessToken,
    presets: tilePresets,
  });

  return (
    <>
      {tiles
        ?.map(({ id, ...tile }) => ({ ...tile, id, provider: providers[id]?.[1] }))
        .map(({ id, tile_opacity: opacity, tile_minLevel: min, tile_maxLevel: max, provider }) =>
          provider ? (
            <ImageryLayer
              key={id}
              imageryProvider={provider}
              minimumTerrainLevel={min}
              maximumTerrainLevel={max}
              alpha={opacity}
            />
          ) : null,
        )}
    </>
  );
}

export function useImageryProviders({
  tiles = [],
  cesiumIonAccessToken,
  presets,
}: {
  tiles?: Tile[];
  cesiumIonAccessToken?: string;
  presets: {
    [key: string]: (url?: string) => ImageryProvider | null;
  };
}): { [id: string]: [string, ImageryProvider] } {
  const newTile = useCallback(
    (t: Tile) =>
      t.tile_url && t.tile_type
        ? presets[t.tile_type](t.tile_url)
        : presets[t.tile_type || "default"](),
    [presets],
  );

  const prevCesiumIonAccessToken = useRef(cesiumIonAccessToken);
  const prevProviders = useRef<{ [id: string]: [string, ImageryProvider] }>({});

  const providers = useMemo(() => {
    const updatedCesiumAccessToken = prevCesiumIonAccessToken.current !== cesiumIonAccessToken;
    const prevTileKeys = Object.keys(prevProviders.current);
    const added = tiles.map(t => t.id).filter(t => t && !prevTileKeys.includes(t));

    const providers = Object.fromEntries(
      [...Object.entries(prevProviders.current), ...added.map(a => [a, undefined] as const)]
        .map(([k, v]) => ({
          key: k,
          added: added.includes(k),
          prevUrl: v?.[0],
          prevProvider: v?.[1],
          tile: tiles.find(t => t.id === k),
        }))
        .map(({ key, added, prevUrl, prevProvider, tile }) =>
          !tile
            ? null
            : [
                key,
                added ||
                prevUrl !== tile.tile_url ||
                (updatedCesiumAccessToken && (!tile.tile_type || tile.tile_type === "default"))
                  ? [tile.tile_url, newTile(tile)]
                  : [prevUrl, prevProvider],
              ],
        )
        .filter((e): e is [string, [string, ImageryProvider]] => !!e),
    );

    return providers;
  }, [tiles, cesiumIonAccessToken, newTile]);

  prevProviders.current = providers;
  return providers;
}
