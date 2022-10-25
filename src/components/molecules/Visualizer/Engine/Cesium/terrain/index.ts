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
  // TEST
  // cesium: () => new GsiTerrainProvider(),
  // https://github.com/CesiumGS/cesium/blob/main/Source/Core/createWorldTerrain.js
  cesium: new CesiumTerrainProvider({
    url: IonResource.fromAssetId(1, { accessToken: Ion.defaultAccessToken }),
    requestVertexNormals: false,
    requestWaterMask: false,
  }),
  arcgis: new ArcGISTiledElevationTerrainProvider({
    url: "https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer",
  }),
  gsi: new GsiTerrainProvider(),
  cesiumion: ({ terrainCesiumAccessToken, terrainCesiumIonResource, terrainCesiumIonUrl }) =>
    terrainCesiumIonResource
      ? new CesiumTerrainProvider({
          url:
            terrainCesiumIonUrl ||
            IonResource.fromAssetId(parseInt(terrainCesiumIonResource, 10), {
              accessToken: terrainCesiumAccessToken || Ion.defaultAccessToken,
            }),
          requestVertexNormals: true,
        })
      : null,
};
