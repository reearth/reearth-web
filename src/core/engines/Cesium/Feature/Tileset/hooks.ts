import {
  Cesium3DTileset as Cesium3DTilesetType,
  Cesium3DTileStyle,
  IonResource,
  ClippingPlane,
  ClippingPlaneCollection as CesiumClippingPlaneCollection,
  Cartesian3,
  Matrix4,
  Transforms,
  TranslationRotationScale,
  HeadingPitchRoll,
  Matrix3,
  Cesium3DTileset,
  Cesium3DTile,
  Cesium3DTileFeature,
} from "cesium";
import { MutableRefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CesiumComponentRef, useCesium } from "resium";

import type { ComputedFeature, ComputedLayer, Feature, EvalFeature, SceneProperty } from "../../..";
import { layerIdField, sampleTerrainHeightFromCartesian } from "../../common";
import { lookupFeatures, translationWithClamping } from "../../utils";
import { attachTag, extractSimpleLayer, extractSimpleLayerData, toColor } from "../utils";

import { useClippingBox } from "./useClippingBox";

import { Property } from ".";

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

const makeFeatureFrom3DTile = (
  id: string,
  feature: Cesium3DTileFeature,
  coordinates: number[],
): Feature => {
  const properties = Object.fromEntries(
    feature.getPropertyIds().map(id => [id, feature.getProperty(id)]),
  );
  return {
    type: "feature",
    id,
    geometry: {
      type: "Point",
      coordinates,
    },
    properties,
    range: {
      x: coordinates[0],
      y: coordinates[1],
      z: coordinates[2],
    },
  };
};

type CachedFeature = {
  feature: Feature;
  raw: Cesium3DTileFeature;
};

const MAX_NUMBER_OF_CONCURRENT_COMPUTING_FEATURES = 5000;

const useFeature = ({
  id,
  tileset,
  layer,
  evalFeature,
  onComputedFeatureFetch,
  onFeatureDelete,
}: {
  id?: string;
  tileset: MutableRefObject<Cesium3DTileset | undefined>;
  layer?: ComputedLayer;
  evalFeature: EvalFeature;
  onComputedFeatureFetch?: (feature: Feature[], computed: ComputedFeature[]) => void;
  onFeatureDelete?: (feature: string[]) => void;
}) => {
  const cachedFeaturesRef = useRef<Map<string, CachedFeature>>(new Map());
  const cachedCalculatedLayerRef = useRef(layer);
  const layerId = layer?.id || id;

  const attachComputedFeature = useCallback(
    async (feature?: CachedFeature) => {
      const layer = cachedCalculatedLayerRef?.current?.layer;
      if (layer?.type === "simple" && feature?.feature) {
        const computedFeature = evalFeature(layer, feature?.feature);
        const show = computedFeature?.["3dtiles"]?.show;
        if (show !== undefined) {
          feature.raw.show = show;
        }
        const color = toColor(computedFeature?.["3dtiles"]?.color);
        if (color !== undefined) {
          feature.raw.color = color;
        }

        return computedFeature;
      }
      return;
    },
    [evalFeature],
  );

  useEffect(() => {
    const currentTiles: Map<Cesium3DTile, string> = new Map();

    tileset.current?.tileLoad.addEventListener((t: Cesium3DTile) => {
      if (currentTiles.has(t)) {
        return;
      }

      const tempFeatures: Feature[] = [];
      const tempComputedFeatures: ComputedFeature[] = [];
      lookupFeatures(t.content, async (tileFeature, content) => {
        const coordinates = content.tile.boundingSphere.center;
        const id = `${coordinates.x}-${coordinates.y}-${coordinates.z}-${tileFeature.featureId}`;
        const feature = (() => {
          const normalFeature = makeFeatureFrom3DTile(id, tileFeature, [
            coordinates.x,
            coordinates.y,
            coordinates.z,
          ]);
          const feature: CachedFeature = {
            feature: normalFeature,
            raw: tileFeature,
          };
          cachedFeaturesRef.current.set(id, feature);
          return feature;
        })();

        attachTag(tileFeature, { layerId, featureId: id });

        const computedFeature = await attachComputedFeature(feature);
        if (computedFeature) {
          tempFeatures.push(feature.feature);
          tempComputedFeatures.push(computedFeature);
        }
      });

      onComputedFeatureFetch?.(tempFeatures, tempComputedFeatures);
    });

    tileset.current?.tileUnload.addEventListener((t: Cesium3DTile) => {
      currentTiles.delete(t);
      const featureIds: string[] = [];
      lookupFeatures(t.content, (tileFeature, content) => {
        const coordinates = content.tile.boundingSphere.center;
        const id = `${coordinates.x}-${coordinates.y}-${coordinates.z}-${tileFeature.featureId}`;
        cachedFeaturesRef.current.delete(id);
        featureIds.push(id);
      });
      onFeatureDelete?.(featureIds);
    });
  }, [
    tileset,
    cachedFeaturesRef,
    attachComputedFeature,
    onComputedFeatureFetch,
    onFeatureDelete,
    layerId,
  ]);

  useEffect(() => {
    cachedCalculatedLayerRef.current = layer;
  }, [layer]);

  // Update 3dtiles styles
  const tileAppearance = useMemo(() => extractSimpleLayer(layer)?.["3dtiles"], [layer]);
  const tileAppearanceShow = tileAppearance?.show;
  const tileAppearanceColor = tileAppearance?.color;

  // If styles are updated while features are calculating,
  // we stop calculating features, and reassign styles.
  const skippedComputingAt = useRef<number | null>();
  useEffect(() => {
    skippedComputingAt.current = Date.now();
  }, [tileAppearanceShow, tileAppearanceColor]);

  const computeFeatureAsync = useCallback(
    async (f: CachedFeature, startedComputingAt: number) =>
      new Promise(resolve =>
        requestAnimationFrame(() => {
          if (skippedComputingAt.current && skippedComputingAt.current > startedComputingAt) {
            resolve(undefined);
            return;
          }

          const properties = f.feature.properties;
          if (properties.show !== tileAppearanceShow || properties.color !== tileAppearanceColor) {
            f.feature.properties.color = tileAppearanceColor;
            f.feature.properties.show = tileAppearanceShow;
            attachComputedFeature(f);
          }
          resolve(undefined);
        }),
      ),
    [tileAppearanceShow, tileAppearanceColor, attachComputedFeature],
  );

  const computeFeatures = useCallback(
    async (startedComputingAt: number) => {
      const tempAsyncProcesses: Promise<unknown>[] = [];
      for (const [_id, f] of cachedFeaturesRef.current) {
        if (skippedComputingAt.current && skippedComputingAt.current > startedComputingAt) {
          break;
        }
        tempAsyncProcesses.push(computeFeatureAsync(f, startedComputingAt));

        if (tempAsyncProcesses.length > MAX_NUMBER_OF_CONCURRENT_COMPUTING_FEATURES) {
          await Promise.all(tempAsyncProcesses);
          tempAsyncProcesses.length = 0;
        }
      }
      if (!(skippedComputingAt.current && skippedComputingAt.current > startedComputingAt)) {
        await Promise.all(tempAsyncProcesses);
      }
    },
    [computeFeatureAsync],
  );

  useEffect(() => {
    const compute = async () => {
      const startedComputingAt = Date.now();
      await computeFeatures(startedComputingAt);
    };
    compute();
  }, [computeFeatures]);
};

export const useHooks = ({
  id,
  boxId,
  isVisible,
  property,
  layer,
  feature,
  meta,
  evalFeature,
  onComputedFeatureFetch,
  onFeatureDelete,
}: {
  id: string;
  boxId: string;
  isVisible?: boolean;
  property?: Property;
  sceneProperty?: SceneProperty;
  layer?: ComputedLayer;
  feature?: ComputedFeature;
  meta?: Record<string, unknown>;
  evalFeature: EvalFeature;
  onComputedFeatureFetch?: (feature: Feature[], computed: ComputedFeature[]) => void;
  onFeatureDelete?: (feature: string[]) => void;
}) => {
  const { viewer } = useCesium();
  const { tileset, styleUrl, edgeColor, edgeWidth, experimental_clipping } = property ?? {};
  const {
    width,
    height,
    length,
    location,
    coordinates,
    heading,
    roll,
    pitch,
    planes: _planes,
    visible: clippingVisible = true,
    direction = "inside",
    builtinBoxProps,
    allowEnterGround,
  } = useClippingBox({ clipping: experimental_clipping, boxId });
  const [style, setStyle] = useState<Cesium3DTileStyle>();
  const { url, type } = useData(layer);

  const prevPlanes = useRef(_planes);
  const planes = useMemo(() => {
    if (
      !prevPlanes.current?.length ||
      !prevPlanes.current?.every(
        (p, i) =>
          p.normal?.x === _planes?.[i].normal?.x &&
          p.normal?.y === _planes?.[i].normal?.y &&
          p.normal?.z === _planes?.[i].normal?.z &&
          p.distance === _planes?.[i].distance,
      )
    ) {
      prevPlanes.current = _planes;
    }
    return prevPlanes.current;
  }, [_planes]);
  const clipDirection = direction === "inside" ? -1 : 1;
  // Create immutable object
  const [clippingPlanes] = useState(
    () =>
      new CesiumClippingPlaneCollection({
        planes: planes?.map(
          plane =>
            new ClippingPlane(
              new Cartesian3(plane.normal?.x, plane.normal?.y, plane.normal?.z),
              (plane.distance || 0) * clipDirection,
            ),
        ),
        unionClippingRegions: direction === "outside",
        edgeWidth: edgeWidth,
        edgeColor: toColor(edgeColor),
      }),
  );
  const tilesetRef = useRef<Cesium3DTilesetType>();

  const ref = useCallback(
    (tileset: CesiumComponentRef<Cesium3DTilesetType> | null) => {
      if (tileset?.cesiumElement) {
        attachTag(tileset.cesiumElement, { layerId: layer?.id || id, featureId: feature?.id });
      }
      if (layer?.id && tileset?.cesiumElement) {
        (tileset?.cesiumElement as any)[layerIdField] = layer.id;
      }
      tilesetRef.current = tileset?.cesiumElement;
    },
    [id, layer?.id, feature?.id],
  );

  useFeature({
    id,
    tileset: tilesetRef,
    layer,
    evalFeature,
    onComputedFeatureFetch,
    onFeatureDelete,
  });

  const [terrainHeightEstimate, setTerrainHeightEstimate] = useState(0);
  const inProgressSamplingTerrainHeight = useRef(false);
  const updateTerrainHeight = useCallback(
    (translation: Cartesian3) => {
      if (inProgressSamplingTerrainHeight.current) {
        return;
      }

      if (!allowEnterGround) {
        inProgressSamplingTerrainHeight.current = true;
        sampleTerrainHeightFromCartesian(viewer.scene, translation).then(v => {
          setTerrainHeightEstimate(v ?? 0);
          inProgressSamplingTerrainHeight.current = false;
        });
      }
    },
    [allowEnterGround, viewer],
  );

  useEffect(() => {
    const coords = coordinates
      ? coordinates
      : location
      ? [location.lng, location.lat, location.height ?? 0]
      : undefined;
    const position = Cartesian3.fromDegrees(coords?.[0] || 0, coords?.[1] || 0, coords?.[2] || 0);

    const prepareClippingPlanes = async () => {
      if (!tilesetRef.current) {
        return;
      }

      try {
        await tilesetRef.current?.readyPromise;
      } catch (e) {
        console.error("Could not load 3D tiles: ", e);
        return;
      }

      const clippingPlanesOriginMatrix = Transforms.eastNorthUpToFixedFrame(
        tilesetRef.current.boundingSphere.center.clone(),
      );

      const dimensions = new Cartesian3(width || 100, length || 100, height || 100);

      if (!allowEnterGround) {
        const trs = new TranslationRotationScale(position, undefined, dimensions);
        translationWithClamping(trs, !!allowEnterGround, terrainHeightEstimate);
        position.x = trs.translation.x;
        position.y = trs.translation.y;
        position.z = trs.translation.z;
      }

      const hpr = heading && pitch && roll ? new HeadingPitchRoll(heading, pitch, roll) : undefined;
      const boxTransform = Matrix4.multiply(
        hpr
          ? Matrix4.fromRotationTranslation(Matrix3.fromHeadingPitchRoll(hpr), position)
          : Transforms.eastNorthUpToFixedFrame(position),
        Matrix4.fromScale(dimensions, new Matrix4()),
        new Matrix4(),
      );

      const inverseOriginalModelMatrix = Matrix4.inverse(clippingPlanesOriginMatrix, new Matrix4());

      Matrix4.multiply(inverseOriginalModelMatrix, boxTransform, clippingPlanes.modelMatrix);
    };

    prepareClippingPlanes();
    if (!allowEnterGround) {
      updateTerrainHeight(position);
    }
  }, [
    width,
    length,
    height,
    heading,
    pitch,
    roll,
    location,
    coordinates,
    clippingPlanes.modelMatrix,
    updateTerrainHeight,
    allowEnterGround,
    terrainHeightEstimate,
  ]);

  useEffect(() => {
    clippingPlanes.enabled = clippingVisible;
  }, [clippingPlanes, clippingVisible]);

  useEffect(() => {
    clippingPlanes.unionClippingRegions = direction === "outside";
  }, [clippingPlanes, direction]);

  useEffect(() => {
    clippingPlanes.removeAll();
    planes?.forEach(plane =>
      clippingPlanes.add(
        new ClippingPlane(
          new Cartesian3(plane.normal?.x, plane.normal?.y, plane.normal?.z),
          (plane.distance || 0) * clipDirection,
        ),
      ),
    );
  }, [planes, clippingPlanes, clipDirection]);

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
    return type === "osm-buildings" && isVisible
      ? IonResource.fromAssetId(96188, {
          accessToken: meta?.cesiumIonAccessToken as string | undefined,
        }) // https://github.com/CesiumGS/cesium/blob/main/packages/engine/Source/Scene/createOsmBuildings.js#L53
      : type === "3dtiles" && isVisible
      ? url ?? tileset
      : null;
  }, [isVisible, tileset, url, type, meta]);

  return {
    tilesetUrl,
    ref,
    style,
    clippingPlanes,
    builtinBoxProps,
  };
};
