import {
  Cartesian3,
  Viewer as CesiumViewer,
  Math as CesiumMath,
  TranslationRotationScale,
  Cartographic,
  Entity,
  Cesium3DTile,
  Cesium3DTileset,
  Cesium3DTileContent,
  Cesium3DTileFeature,
} from "cesium";

import { getTag } from "./Feature";

export const convertCartesian3ToPosition = (
  cesium?: CesiumViewer,
  pos?: Cartesian3,
): { lat: number; lng: number; height: number } | undefined => {
  if (!pos) return;
  const cartographic = cesium?.scene.globe.ellipsoid.cartesianToCartographic(pos);
  if (!cartographic) return;
  return {
    lat: CesiumMath.toDegrees(cartographic.latitude),
    lng: CesiumMath.toDegrees(cartographic.longitude),
    height: cartographic.height,
  };
};

export const translationWithClamping = (
  trs: TranslationRotationScale,
  allowEnterGround: boolean,
  terrainHeightEstimate: number,
) => {
  if (!allowEnterGround) {
    const cartographic = Cartographic.fromCartesian(trs.translation, undefined, new Cartographic());
    const boxBottomHeight = cartographic.height - trs.scale.z / 2;
    const floorHeight = terrainHeightEstimate;
    if (boxBottomHeight < floorHeight) {
      cartographic.height += floorHeight - boxBottomHeight;
      Cartographic.toCartesian(cartographic, undefined, trs.translation);
    }
  }
};

export function lookupFeatures(
  c: Cesium3DTileContent,
  cb: (feature: Cesium3DTileFeature, content: Cesium3DTileContent) => void,
) {
  if (!c) return;
  const length = c.featuresLength;
  for (let i = 0; i < length; i++) {
    const f = c.getFeature(i);
    if (!f) {
      continue;
    }
    cb(f, c);
  }
  c.innerContents?.forEach(c => lookupFeatures(c, cb));
  return;
}

const findFeatureFrom3DTile = (
  tile: Cesium3DTile,
  featureId?: string,
): Cesium3DTileFeature | void => {
  let target: Cesium3DTileFeature | undefined = undefined;
  lookupFeatures(tile.content, f => {
    const tag = getTag(f);
    if (tag?.featureId === featureId) {
      target = f;
    }
  });

  if (target) {
    return target;
  }

  for (const child of tile.children) {
    const t = findFeatureFrom3DTile(child, featureId);
    if (t) {
      return t;
    }
  }
};

export function findEntity(
  viewer: CesiumViewer,
  layerId?: string,
  featureId?: string,
): Entity | Cesium3DTileset | Cesium3DTileFeature | undefined {
  const id = featureId ?? layerId;
  const keyName = featureId ? "featureId" : "layerId";
  if (!id) return;

  let entity = viewer.entities.getById(id);
  if (entity) return entity;

  entity = viewer.entities.values.find(e => getTag(e)?.[keyName] === id);
  if (entity) return entity;

  for (const ds of [viewer.dataSourceDisplay.dataSources, viewer.dataSources]) {
    for (let i = 0; i < ds.length; i++) {
      const entities = ds.get(i).entities.values;
      const e = entities.find(e => getTag(e)?.[keyName] === id);
      if (e) {
        return e;
      }
    }
  }

  // Find Cesium3DTileFeature
  for (let i = 0; i < viewer.scene.primitives.length; i++) {
    const prim = viewer.scene.primitives.get(i);
    if (!(prim instanceof Cesium3DTileset)) {
      continue;
    }

    const target = findFeatureFrom3DTile(prim.root, featureId);
    if (target) {
      return target;
    }
  }

  // Find Cesium3DTileset
  for (let i = 0; i < viewer.scene.primitives.length; i++) {
    const prim = viewer.scene.primitives.get(i);
    if (!(prim instanceof Cesium3DTileset)) {
      continue;
    }

    const tag = getTag(prim);
    if (tag?.layerId === layerId) {
      return prim;
    }
  }

  return;
}
