import {
  ArcGISTiledElevationTerrainProvider,
  EllipsoidTerrainProvider,
  IonResource,
  CesiumTerrainProvider,
  Ion,
  TerrainProvider,
} from "cesium";

import { TerrainProperty } from "../../ref";

import GsiTerrainProvider from "./gsi";

export const defaultTerrainProvider = new EllipsoidTerrainProvider();

export const terrainProviders: {
  [k in NonNullable<TerrainProperty["terrainType"]>]:
    | TerrainProvider
    | ((terrainProperty: TerrainProperty) => TerrainProvider | null);
} = {
  cesium: ({ terrainCesiumIonAccessToken: terrainCesiumAccessToken }) =>
    // https://github.com/CesiumGS/cesium/blob/main/Source/Core/createWorldTerrain.js
    new CesiumTerrainProvider({
      url: IonResource.fromAssetId(1, {
        accessToken: terrainCesiumAccessToken || Ion.defaultAccessToken,
      }),
      requestVertexNormals: false,
      requestWaterMask: false,
    }),
  arcgis: () =>
    new ArcGISTiledElevationTerrainProvider({
      url: "https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer",
    }),
  gsi: () => new GsiTerrainProvider(),
  cesiumion: ({ terrainCesiumIonAccessToken, terrainCesiumIonAsset, terrainCesiumIonUrl }) =>
    terrainCesiumIonAsset
      ? new CesiumTerrainProvider({
          url:
            terrainCesiumIonUrl ||
            IonResource.fromAssetId(parseInt(terrainCesiumIonAsset, 10), {
              accessToken: terrainCesiumIonAccessToken || Ion.defaultAccessToken,
            }),
          requestVertexNormals: true,
        })
      : null,
};
