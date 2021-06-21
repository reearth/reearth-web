import { useEffect, useMemo, useRef, useState } from "react";
import { useDeepCompareEffect } from "react-use";
import { CesiumComponentRef } from "resium";
import {
  Viewer as CesiumViewer,
  ScreenSpaceEventType,
  ImageryProvider,
  TerrainProvider,
  createWorldTerrain,
  EllipsoidTerrainProvider,
  Color,
  Ion,
} from "cesium";

import { Camera } from "@reearth/util/value";
import { Ref as EngineRef } from "..";
import useEntitySelection from "./useEntitySelection";
import tiles from "./tiles";
import useCamera from "./useCamera";
import useEngineAPI from "./useEngineAPI";
import useEngineRef from "./useEngineRef";

declare global {
  interface Window {
    REEARTH_E2E_ACCESS_TOKEN?: string;
    REEARTH_E2E_CESIUM_VIEWER?: CesiumViewer;
  }
}

export type SceneProperty = {
  default?: {
    camera?: Camera;
    terrain?: boolean;
    skybox?: boolean;
    bgcolor?: string;
    ion?: string;
  };
  tiles?: {
    id: string;
    tile_type?: string;
    tile_url?: string;
    tile_maxLevel?: number;
    tile_minLevel?: number;
  }[];
  atmosphere?: {
    enable_sun?: boolean;
    enable_lighting?: boolean;
    ground_atmosphere?: boolean;
    sky_atmosphere?: boolean;
    fog?: boolean;
    fog_density?: number;
    brightness_shift?: number;
    hue_shift?: number;
    surturation_shift?: number;
  };
};

export default ({
  ready,
  selectedLayerId,
  property,
  camera: cameraState,
  ref,
  onLayerSelect,
  onCameraChange,
}: {
  selectedLayerId?: string;
  property?: SceneProperty;
  ready?: boolean;
  camera?: Camera;
  ref: React.ForwardedRef<EngineRef>;
  onLayerSelect?: (id?: string) => void;
  onCameraChange?: (camera: Camera) => void;
}) => {
  const cesium = useRef<CesiumComponentRef<CesiumViewer>>(null);

  // expose ref
  useEngineRef(ref, cesium, cameraState);

  // expose api
  const api = useEngineAPI(cesium);

  // imagery layers
  const [imageryLayers, setImageryLayers] = useState<
    [string, ImageryProvider, number | undefined, number | undefined][]
  >();

  useDeepCompareEffect(() => {
    const newTiles = (property?.tiles?.length ? property.tiles : undefined)
      ?.map(
        t =>
          [t.id, t.tile_type || "default", t.tile_url, t.tile_minLevel, t.tile_maxLevel] as const,
      )
      .map<[string, ImageryProvider | null, number | undefined, number | undefined]>(
        ([id, type, url, min, max]) => [
          id,
          type ? (url ? tiles[type](url) : tiles[type]()) : null,
          min,
          max,
        ],
      )
      .filter(
        (t): t is [string, ImageryProvider, number | undefined, number | undefined] => !!t[1],
      );
    setImageryLayers(newTiles);
  }, [property?.tiles ?? []]);

  const terrainProvider = useMemo((): TerrainProvider | undefined => {
    return property?.default?.terrain ? createWorldTerrain() : new EllipsoidTerrainProvider();
  }, [property?.default?.terrain]);

  const backgroundColor = useMemo(
    () =>
      property?.default?.bgcolor ? Color.fromCssColorString(property.default.bgcolor) : undefined,
    [property?.default?.bgcolor],
  );

  // Ensure to set Cesium Ion access token before the first rendering
  // But it does not work well...
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (!ready) return;
    const { ion } = property?.default ?? {};
    if (ion) {
      Ion.defaultAccessToken = ion;
    }
    if (loaded) return;
    setLoaded(true);
  }, [loaded, property?.default, ready]);

  // manage camera
  useCamera({
    camera: cameraState,
    initialCamera: property?.default?.camera,
    viewer: cesium.current?.cesiumElement,
    onCameraChange,
  });

  // manage layer selection
  const selectViewerEntity = useEntitySelection(cesium, selectedLayerId, onLayerSelect);

  // init
  useEffect(() => {
    const v = cesium.current?.cesiumElement;
    v?.screenSpaceEventHandler.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
    v?.screenSpaceEventHandler.removeInputAction(ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
  }, []);

  // E2E test
  useEffect(() => {
    if (window.REEARTH_E2E_ACCESS_TOKEN) {
      window.REEARTH_E2E_CESIUM_VIEWER = cesium.current?.cesiumElement;
      return () => {
        delete window.REEARTH_E2E_CESIUM_VIEWER;
      };
    }
    return;
  }, [cesium.current?.cesiumElement]);

  // update
  useEffect(() => {
    cesium.current?.cesiumElement?.scene.requestRender();
  });

  return {
    api,
    loaded,
    terrainProvider,
    backgroundColor,
    imageryLayers,
    cesium,
    selectViewerEntity,
  };
};
