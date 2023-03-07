import { VectorTileFeature } from "@mapbox/vector-tile";
import {
  ImageryLayerCollection,
  ImageryLayerFeatureInfo,
  ImageryProvider,
  WebMapServiceImageryProvider,
} from "cesium";
import { MVTImageryProvider } from "cesium-mvt-imagery-provider";
import md5 from "js-md5";
import { isEqual, pick } from "lodash-es";
import { useEffect, useMemo, useRef } from "react";
import { useCesium } from "resium";

import type { ComputedFeature, ComputedLayer, Feature, PolygonAppearance } from "../../..";
import { extractSimpleLayer, extractSimpleLayerData } from "../utils";

import { Props } from "./types";

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
      parameters: data?.parameters,
    };
  }, [layer]);
};

export const useWMS = ({
  isVisible,
  property,
  layer,
}: Pick<Props, "isVisible" | "property" | "layer">) => {
  const { show = true, minimumLevel, maximumLevel, credit } = property ?? {};
  const { type, url, layers, parameters } = useData(layer);

  const imageryProvider = useMemo(() => {
    if (!isVisible || !show || !url || !layers || type !== "wms") return;
    return new WebMapServiceImageryProvider({
      url,
      layers,
      minimumLevel,
      maximumLevel,
      credit,
      parameters,
    });
  }, [isVisible, show, url, layers, type, minimumLevel, maximumLevel, credit, parameters]);

  useImageryProvider(imageryProvider);
};

type TileCoords = { x: number; y: number; level: number };

const idFromGeometry = (
  geometry: ReturnType<VectorTileFeature["loadGeometry"]>,
  tile: TileCoords,
) => {
  const id = [tile.x, tile.y, tile.level, ...geometry.flatMap(i => i.map(j => [j.x, j.y]))].join(
    ":",
  );

  const hash = md5.create();
  hash.update(id);

  return hash.hex();
};

const makeFeatureFromPolygon = (
  id: string,
  feature: VectorTileFeature,
  tile: TileCoords,
): Feature => {
  const geometry = feature.loadGeometry();
  const coordinates = geometry.map(points => points.map(p => [p.x, p.y]));
  return {
    type: "feature",
    id,
    geometry: {
      type: "Polygon",
      coordinates,
    },
    properties: feature.properties,
    range: {
      x: tile.x,
      y: tile.y,
      z: tile.level,
    },
  };
};

export const useMVT = ({
  isVisible,
  property,
  layer,
  onComputedFeatureFetch,
  evalFeature,
  onFeatureDelete,
}: Pick<
  Props,
  "isVisible" | "property" | "layer" | "onComputedFeatureFetch" | "evalFeature" | "onFeatureDelete"
>) => {
  const { show = true, minimumLevel, maximumLevel, credit } = property ?? {};
  const { type, url, layers } = useData(layer);

  const cachedFeaturesRef = useRef<Map<Feature["id"], Feature>>(new Map());
  const cachedComputedFeaturesRef = useRef<Map<Feature["id"], ComputedFeature>>(new Map());
  const cachedCalculatedLayerRef = useRef(layer);

  const cachedFeatureIdsRef = useRef(new Set<Feature["id"]>());
  const shouldSyncFeatureRef = useRef(false);

  const layerSimple = extractSimpleLayer(layer);
  const layerPolygonAppearance = usePick(layerSimple?.polygon, polygonAppearanceFields);

  const tempFeaturesRef = useRef<Feature[]>([]);
  const tempComputedFeaturesRef = useRef<ComputedFeature[]>([]);
  const imageryProvider = useMemo(() => {
    if (!isVisible || !show || !url || !layers || type !== "mvt") return;
    return new MVTImageryProvider({
      minimumLevel,
      maximumLevel,
      credit,
      urlTemplate: url as `http${"s" | ""}://${string}/{z}/{x}/{y}${string}`,
      layerName: layers,
      onRenderFeature: () => {
        return true;
      },
      onFeaturesRendered: () => {
        if (shouldSyncFeatureRef.current) {
          const features = tempFeaturesRef.current;
          const computedFeatures = tempComputedFeaturesRef.current;
          requestAnimationFrame(() => {
            onComputedFeatureFetch?.(features, computedFeatures);
          });
          tempFeaturesRef.current = [];
          tempComputedFeaturesRef.current = [];
          shouldSyncFeatureRef.current = false;
        }
      },
      style: (mvtFeature, tile) => {
        const id = idFromGeometry(mvtFeature.loadGeometry(), tile);
        if (!cachedFeatureIdsRef.current.has(id)) {
          shouldSyncFeatureRef.current = true;
          cachedFeatureIdsRef.current.add(id);
        }

        const [feature, computedFeature] =
          ((): [Feature | undefined, ComputedFeature | undefined] | void => {
            const layer = cachedCalculatedLayerRef.current?.layer;
            if (
              layer?.type === "simple" &&
              VectorTileFeature.types[mvtFeature.type] === "Polygon"
            ) {
              if (!cachedFeaturesRef.current.has(id)) {
                const feature = makeFeatureFromPolygon(id, mvtFeature, tile);
                cachedFeaturesRef.current.set(id, feature);
                const computedFeature = evalFeature?.(layer, feature);
                if (computedFeature) {
                  cachedComputedFeaturesRef.current.set(id, computedFeature);
                }
                return [feature, computedFeature];
              } else {
                const feature = cachedFeaturesRef.current.get(id);
                if (!feature) {
                  return;
                }

                const featurePolygonAppearance = pick(feature?.properties, polygonAppearanceFields);
                if (!isEqual(layerPolygonAppearance, featurePolygonAppearance)) {
                  Object.entries(layerPolygonAppearance ?? {}).forEach(([k, v]) => {
                    feature.properties[k] = v;
                  });

                  const computedFeature = evalFeature?.(layer, feature);
                  if (computedFeature) {
                    cachedComputedFeaturesRef.current.set(id, computedFeature);
                  }
                }
                return [
                  feature,
                  cachedComputedFeaturesRef.current.get(
                    idFromGeometry(mvtFeature.loadGeometry(), tile),
                  ),
                ];
              }
            }
          })() || [];

        if (feature && computedFeature) {
          tempFeaturesRef.current.push(feature);
          tempComputedFeaturesRef.current.push(computedFeature);
        }

        const polygon = computedFeature?.polygon;
        return {
          fillStyle:
            (polygon?.fill ?? true) && (polygon?.show ?? true)
              ? polygon?.fillColor
              : "rgba(0,0,0,0)", // hide the feature
          strokeStyle:
            polygon?.stroke && (polygon?.show ?? true) ? polygon?.strokeColor : "rgba(0,0,0,0)", // hide the feature
          lineWidth: polygon?.strokeWidth,
          lineJoin: polygon?.lineJoin,
        };
      },
      onSelectFeature: (mvtFeature, tile) => {
        const featureId = idFromGeometry(mvtFeature.loadGeometry(), tile);
        const layerId = cachedCalculatedLayerRef.current?.layer.id;
        const l = new ImageryLayerFeatureInfo();
        l.data = {
          featureId,
          layerId,
        };
        return l;
      },
    });
  }, [
    isVisible,
    show,
    url,
    layers,
    type,
    minimumLevel,
    maximumLevel,
    credit,
    onComputedFeatureFetch,
    evalFeature,
    layerPolygonAppearance,
  ]);

  useEffect(() => {
    cachedCalculatedLayerRef.current = layer;
  }, [layer]);

  useEffect(() => {
    const ids = cachedFeatureIdsRef.current;
    return () => {
      onFeatureDelete?.(Array.from(ids.values()));
    };
  }, [onFeatureDelete]);

  useImageryProvider(imageryProvider);
};

export const usePick = <T extends object, U extends keyof T>(
  o: T | undefined | null,
  fields: readonly U[],
): Pick<T, U> | undefined => {
  const p = useMemo(() => (o ? pick(o, fields) : undefined), [o, fields]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => p, [JSON.stringify(p)]);
};

const polygonAppearanceFields: (keyof PolygonAppearance)[] = [
  "show",
  "fill",
  "fillColor",
  "stroke",
  "strokeColor",
  "strokeWidth",
  "lineJoin",
];
