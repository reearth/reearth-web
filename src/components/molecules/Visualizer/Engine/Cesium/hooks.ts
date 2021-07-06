import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useDeepCompareEffect } from "react-use";
import { CesiumComponentRef } from "resium";
import {
  Viewer as CesiumViewer,
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
import useEngineRef from "./useEngineRef";
import { getCamera } from "./common";

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
  selectedLayerId,
  property,
  ref,
  onLayerSelect,
  onCameraChange,
}: {
  selectedLayerId?: string;
  property?: SceneProperty;
  ref: React.ForwardedRef<EngineRef>;
  onLayerSelect?: (id?: string) => void;
  onCameraChange?: (camera: Camera) => void;
}) => {
  const cesium = useRef<CesiumComponentRef<CesiumViewer>>(null);

  // Ensure to set Cesium Ion access token before the first rendering
  useLayoutEffect(() => {
    const { ion } = property?.default ?? {};
    if (ion) {
      Ion.defaultAccessToken = ion;
    }
  }, [property?.default]);

  // expose ref
  useEngineRef(ref, cesium);

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

  // move to initial position at startup
  useEffect(() => {
    if (!property?.default?.camera) return;
    onCameraChange?.(property.default.camera);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ignor property?.default?.camera and onCameraChange

  // call onCameraChange event after moving camera
  const onCameraMoveEnd = useCallback(() => {
    if (!cesium?.current?.cesiumElement) return;
    const c = getCamera(cesium.current.cesiumElement);
    if (c) {
      onCameraChange?.(c);
    }
  }, [onCameraChange]);

  // manage layer selection
  const selectViewerEntity = useEntitySelection(cesium, selectedLayerId, onLayerSelect);

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
    terrainProvider,
    backgroundColor,
    imageryLayers,
    cesium,
    selectViewerEntity,
    onCameraMoveEnd,
  };
};
