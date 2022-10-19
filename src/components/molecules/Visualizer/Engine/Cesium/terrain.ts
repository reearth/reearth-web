import {
  ArcGISTiledElevationTerrainProvider,
  EllipsoidTerrainProvider,
  IonResource,
  CesiumTerrainProvider,
  Ion,
} from "cesium";

export default {
  default: new EllipsoidTerrainProvider(),
  cesium: () =>
    // https://github.com/CesiumGS/cesium/blob/main/Source/Core/createWorldTerrain.js
    new CesiumTerrainProvider({
      url: IonResource.fromAssetId(1, { accessToken: Ion.defaultAccessToken }),
      requestVertexNormals: false,
      requestWaterMask: false,
    }),
  arcgis: new ArcGISTiledElevationTerrainProvider({
    url: "https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer",
  }),
  url: new CesiumTerrainProvider({
    url: IonResource.fromAssetId(770371, {
      accessToken:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5N2UyMjcwOS00MDY1LTQxYjEtYjZjMy00YTU0ZTg5MmViYWQiLCJpZCI6ODAzMDYsImlhdCI6MTY0Mjc0ODI2MX0.dkwAL1CcljUV7NA7fDbhXXnmyZQU_c-G5zRx8PtEcxE",
    }),
    requestVertexNormals: true,
  }),
};
