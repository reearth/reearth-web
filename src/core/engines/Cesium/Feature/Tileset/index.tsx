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
} from "cesium";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Cesium3DTileset, CesiumComponentRef, useCesium } from "resium";

import { toColor } from "@reearth/core/mantle";

import type { Cesium3DTilesAppearance } from "../../..";
import { layerIdField, sampleTerrainHeightFromCartesian, shadowMode } from "../../common";
import { translationWithClamping } from "../../utils";
import { attachTag, type FeatureComponentConfig, type FeatureProps } from "../utils";

export type Props = FeatureProps<Property>;

export type Property = Cesium3DTilesAppearance;

function Tileset({
  id,
  isVisible,
  property,
  layer,
  feature,
  sceneProperty,
}: Props): JSX.Element | null {
  const { viewer } = useCesium();
  const { sourceType, tileset, styleUrl, shadows, edgeColor, edgeWidth, experimental_clipping } =
    property ?? {};
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
  } = experimental_clipping || {};
  const { allowEnterGround } = sceneProperty?.default || {};
  const [style, setStyle] = useState<Cesium3DTileStyle>();

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
  // Create immutable object
  const [clippingPlanes] = useState(
    () =>
      new CesiumClippingPlaneCollection({
        planes: planes?.map(
          plane =>
            new ClippingPlane(
              new Cartesian3(plane.normal?.x, plane.normal?.y, plane.normal?.z),
              (plane.distance || 0) * -1,
            ),
        ),
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

  // Keep to have array references as much as possible for prevent unnecessary re-render.
  const coordinatesRef = useRef<number[]>();
  useEffect(() => {
    const next = coordinates
      ? coordinates
      : location
      ? [location.lng, location.lat, location.height ?? 0]
      : undefined;

    if (!next) {
      return;
    }

    if (!coordinatesRef.current || !next.every((v, i) => coordinatesRef.current?.[i] === v)) {
      coordinatesRef.current = next;
    }
  }, [coordinates, location]);

  useEffect(() => {
    const prepareClippingPlanes = async () => {
      if (!tilesetRef.current) {
        return;
      }

      await tilesetRef.current?.readyPromise;

      const clippingPlanesOriginMatrix = Transforms.eastNorthUpToFixedFrame(
        tilesetRef.current.boundingSphere.center.clone(),
      );

      const dimensions = new Cartesian3(width || 100, length || 100, height || 100);

      const coordinates = coordinatesRef.current;
      const position = Cartesian3.fromDegrees(
        coordinates?.[0] || 0,
        coordinates?.[1] || 0,
        coordinates?.[2] || 0,
      );

      if (!allowEnterGround) {
        translationWithClamping(
          new TranslationRotationScale(position, undefined, dimensions),
          !!allowEnterGround,
          terrainHeightEstimate,
        );
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

    if (!allowEnterGround) {
      updateTerrainHeight(Matrix4.getTranslation(clippingPlanes.modelMatrix, new Cartesian3()));
    }
    prepareClippingPlanes();
  }, [
    width,
    length,
    height,
    heading,
    pitch,
    roll,
    clippingPlanes.modelMatrix,
    updateTerrainHeight,
    allowEnterGround,
    terrainHeightEstimate,
  ]);

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
      ? IonResource.fromAssetId(96188) // https://github.com/CesiumGS/cesium/blob/main/packages/engine/Source/Scene/createOsmBuildings.js#L53
      : isVisible
      ? tileset
      : null;
  }, [isVisible, sourceType, tileset]);

  return !isVisible || (!tileset && !sourceType) || !tilesetUrl ? null : (
    <Cesium3DTileset
      ref={ref}
      url={tilesetUrl}
      style={style}
      shadows={shadowMode(shadows)}
      clippingPlanes={clippingPlanes}
    />
  );
}

export default memo(Tileset);

export const config: FeatureComponentConfig = {
  noFeature: true,
};
