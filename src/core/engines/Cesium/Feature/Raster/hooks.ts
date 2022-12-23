import { VectorTileFeature } from "@mapbox/vector-tile";
import { ImageryLayerCollection, ImageryProvider, WebMapServiceImageryProvider } from "cesium";
import { MVTImageryProvider } from "cesium-mvt-imagery-provider";
import { useEffect, useMemo, useRef, useState, useReducer } from "react";
import { useCesium } from "resium";

import { ComputedLayer, Feature } from "@reearth/core/mantle";

import { extractSimpleLayerData } from "../utils";

import { Props } from ".";

const useImageryProvider = (imageryProvider: ImageryProvider | undefined) => {
  const { viewer } = useCesium();
  useEffect(() => {
    if (!imageryProvider) return;
    const imageryLayers: ImageryLayerCollection = viewer.imageryLayers;
    const layer = imageryLayers.addImageryProvider(imageryProvider);
    return () => {
      imageryLayers.remove(layer);
    };
  }, [imageryProvider, viewer]);
};

const useData = (layer: ComputedLayer | undefined) => {
  return useMemo(() => {
    const data = extractSimpleLayerData(layer);
    return {
      type: data?.type,
      url: data?.url,
      layers: data?.layers
        ? Array.isArray(data.layers)
          ? data.layers.join(",")
          : data?.layers
        : undefined,
    };
  }, [layer]);
};

export const useWMS = ({
  isVisible,
  property,
  layer,
}: Pick<Props, "isVisible" | "property" | "layer">) => {
  const { minimumLevel, maximumLevel, credit } = property ?? {};
  const { type, url, layers } = useData(layer);

  const imageryProvider = useMemo(() => {
    if (!isVisible || !url || !layers) return;
    if (type !== "wms") {
      return;
    }
    return new WebMapServiceImageryProvider({
      url,
      layers,
      minimumLevel,
      maximumLevel,
      credit,
    });
  }, [isVisible, type, url, minimumLevel, maximumLevel, credit, layers]);

  useImageryProvider(imageryProvider);
};

const idFromGeometry = (tile: { x: number; y: number; level: number }) =>
  [tile.x, tile.y, tile.level].join(":");

export const useMVT = ({
  isVisible,
  property,
  layer,
  onFeatureFetch,
}: Pick<Props, "isVisible" | "property" | "layer" | "onFeatureFetch">) => {
  const { minimumLevel, maximumLevel, credit } = property ?? {};
  const { type, url, layers } = useData(layer);

  const [cachedFeatureIds] = useState(() => new Set<Feature["id"]>());
  const cachedFeaturesRef = useRef<Feature[]>([]);
  const cachedCalculatedFeaturesRef = useRef(layer?.features || []);
  const [forceRasterizeMarker, forceRasterize] = useReducer(() => ({}), {});
  const shouldRasterizeRef = useRef(false);

  const imageryProvider = useMemo(() => {
    if (!isVisible || !url || !layers) return;
    if (type !== "mvt") {
      return;
    }
    return new MVTImageryProvider({
      minimumLevel,
      maximumLevel,
      credit,
      urlTemplate: url as `http${"s" | ""}://${string}/{z}/{x}/{y}${string}`,
      layerName: layers,
      onRenderFeature: (mvtFeature, tile) => {
        const id = mvtFeature.id ? String(mvtFeature.id) : idFromGeometry(tile);
        if (cachedFeatureIds.has(id)) {
          return true;
        }

        // Rasterize MVT only when unknown feature is exist.
        shouldRasterizeRef.current = true;

        if (VectorTileFeature.types[mvtFeature.type] === "Polygon") {
          const geometry = mvtFeature.loadGeometry();
          const coordinates = geometry.map(points => points.map(p => [p.x, p.y]));
          cachedFeatureIds.add(id);
          cachedFeaturesRef.current.push({
            id,
            geometry: {
              type: "Polygon",
              coordinates,
            },
            properties: mvtFeature.properties,
            range: {
              x: tile.x,
              y: tile.y,
              z: tile.level,
            },
          });
        }
        return false;
      },
      onFeaturesRendered: () => {
        if (shouldRasterizeRef.current) {
          onFeatureFetch?.(cachedFeaturesRef.current);
          shouldRasterizeRef.current = false;
        }
      },
      style: (mvtFeature, tile) => {
        const feature = cachedCalculatedFeaturesRef.current.find(
          f => f.id === (mvtFeature.id ? String(mvtFeature.id) : idFromGeometry(tile)),
        );
        return {
          fillStyle: feature?.raster?.fillColor,
          strokeStyle: feature?.raster?.strokeColor,
          lineWidth: feature?.raster?.strokeWidth,
          lineJoin: feature?.raster?.lineJoin,
        };
      },
    });
  }, [
    isVisible,
    type,
    url,
    minimumLevel,
    maximumLevel,
    credit,
    layers,
    cachedFeatureIds,
    onFeatureFetch,
    forceRasterizeMarker, // This is needed to rasterize the ImageryProvider lazily for performance.
  ]);

  // Debounce rasterize of MVT.
  // `onFeatureFetch` is called frequently, so we need to rasterize lazily.
  const debouncingForceRasterizeTimer = useRef<NodeJS.Timeout>();
  useEffect(() => {
    cachedCalculatedFeaturesRef.current = layer?.features || [];
    clearTimeout(debouncingForceRasterizeTimer.current);
    debouncingForceRasterizeTimer.current = setTimeout(() => {
      forceRasterize();
    }, 100);
  }, [layer?.features]);

  useImageryProvider(imageryProvider);
};
