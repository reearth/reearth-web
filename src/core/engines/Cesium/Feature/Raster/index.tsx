import { ImageryLayerCollection, WebMapServiceImageryProvider } from "cesium";
import { useEffect, useMemo } from "react";
import { useCesium } from "resium";

import type { RasterAppearance } from "../../..";
import { extractSimpleLayerData, type FeatureComponentConfig, type FeatureProps } from "../utils";

export type Props = FeatureProps<Property>;
export type Property = RasterAppearance;

const imageryProviders = {
  wms: WebMapServiceImageryProvider,
};

export default function Raster({ isVisible, layer, property }: Props) {
  const { layers, zIndex, minimumLevel, maximumLevel, credit } = property ?? {};
  const { viewer } = useCesium();
  const [type, url] = useMemo((): [RasterAppearance["type"], string | undefined] => {
    const data = extractSimpleLayerData(layer);
    const type = layer?.raster?.type;
    const url = layer?.raster?.url;
    return [type ?? (data?.type as RasterAppearance["type"]), url ?? data?.url];
  }, [layer]);

  const imageryProvider = type ? imageryProviders[type] : undefined;

  useEffect(() => {
    if (!isVisible || !imageryProvider || !url || !layers?.length) return;
    const provider = new imageryProvider({
      url,
      layers: layers.join(","),
      minimumLevel,
      maximumLevel,
      credit,
    });
    const imageryLayers: ImageryLayerCollection = viewer.imageryLayers;
    const layer = imageryLayers.addImageryProvider(provider, zIndex);
    return () => {
      imageryLayers.remove(layer);
    };
  }, [isVisible, imageryProvider, url, zIndex, viewer, layers, minimumLevel, maximumLevel, credit]);

  return null;
}

export const config: FeatureComponentConfig = {
  noFeature: true,
};
