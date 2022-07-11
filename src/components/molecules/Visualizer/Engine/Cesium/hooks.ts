import { Color, Entity, Ion, Cesium3DTileFeature, Cartesian3 } from "cesium";
import type { Viewer as CesiumViewer, ImageryProvider, TerrainProvider } from "cesium";
import CesiumDnD, { Context } from "cesium-dnd";
import { isEqual } from "lodash-es";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDeepCompareEffect } from "react-use";
import type { CesiumComponentRef, CesiumMovementEvent, RootEventTarget } from "resium";
import { useCustomCompareCallback } from "use-custom-compare";

import { Camera, LatLng } from "@reearth/util/value";

import type { SelectLayerOptions, Ref as EngineRef, SceneProperty } from "..";

import { useCameraLimiter } from "./cameraLimiter";
import { getCamera, isDraggable, isSelectable, layerIdField } from "./common";
import imagery from "./imagery";
import terrain from "./terrain";
import useEngineRef from "./useEngineRef";
import { convertCartesian3ToPosition } from "./utils";

export type ImageryLayerData = {
  id: string;
  provider: ImageryProvider;
  min?: number;
  max?: number;
  opacity?: number;
};

const cesiumIonDefaultAccessToken = Ion.defaultAccessToken;

export default ({
  ref,
  property,
  camera,
  selectedLayerId,
  onLayerSelect,
  onCameraChange,
  isLayerDraggable,
  onLayerDrag,
  onLayerDrop,
}: {
  ref: React.ForwardedRef<EngineRef>;
  property?: SceneProperty;
  camera?: Camera;
  selectedLayerId?: string;
  onLayerSelect?: (id?: string, options?: SelectLayerOptions) => void;
  onCameraChange?: (camera: Camera) => void;
  isLayerDraggable?: boolean;
  onLayerDrag?: (layerId: string, position: LatLng) => void;
  onLayerDrop?: (layerId: string, propertyKey: string, position: LatLng | undefined) => void;
}) => {
  const cesium = useRef<CesiumComponentRef<CesiumViewer>>(null);
  const cesiumIonAccessToken = property?.default?.ion;
  // Ensure to set Cesium Ion access token before the first rendering
  Ion.defaultAccessToken = cesiumIonAccessToken || cesiumIonDefaultAccessToken;

  // expose ref
  const engineAPI = useEngineRef(ref, cesium);

  // imagery layers
  const [imageryLayers, setImageryLayers] = useState<ImageryLayerData[]>();

  useDeepCompareEffect(() => {
    const newTiles = (property?.tiles?.length ? property.tiles : undefined)
      ?.map(
        t =>
          [
            t.id,
            t.tile_type || "default",
            t.tile_url,
            t.tile_minLevel,
            t.tile_maxLevel,
            t.tile_opacity,
          ] as const,
      )
      .map(
        ([id, type, url, min, max, opacity]) =>
          <ImageryLayerData>{
            id,
            provider: type ? (url ? imagery[type](url) : imagery[type]()) : null,
            min,
            max,
            opacity,
          },
      )
      .filter(t => !!t.provider);
    setImageryLayers(newTiles);
  }, [property?.tiles ?? [], cesiumIonAccessToken]);

  // terrain
  const terrainProperty = useMemo(
    () => ({
      terrain: property?.terrain?.terrain || property?.default?.terrain,
      terrainType: property?.terrain?.terrainType || property?.default?.terrainType,
      terrainExaggeration:
        property?.terrain?.terrainExaggeration || property?.default?.terrainExaggeration,
      terrainExaggerationRelativeHeight:
        property?.terrain?.terrainExaggerationRelativeHeight ||
        property?.default?.terrainExaggerationRelativeHeight,
      depthTestAgainstTerrain:
        property?.terrain?.depthTestAgainstTerrain || property?.default?.depthTestAgainstTerrain,
    }),
    [
      property?.default?.terrain,
      property?.default?.terrainType,
      property?.default?.terrainExaggeration,
      property?.default?.terrainExaggerationRelativeHeight,
      property?.default?.depthTestAgainstTerrain,
      property?.terrain?.terrain,
      property?.terrain?.terrainType,
      property?.terrain?.terrainExaggeration,
      property?.terrain?.terrainExaggerationRelativeHeight,
      property?.terrain?.depthTestAgainstTerrain,
    ],
  );

  const terrainProvider = useMemo((): TerrainProvider | undefined => {
    const provider = terrainProperty.terrain
      ? terrainProperty.terrainType
        ? terrain[terrainProperty.terrainType] || terrain.default
        : terrain.cesium
      : terrain.default;
    return typeof provider === "function" ? provider() : provider;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cesiumIonAccessToken, terrainProperty.terrain, terrainProperty.terrainType]);

  const backgroundColor = useMemo(
    () =>
      property?.default?.bgcolor ? Color.fromCssColorString(property.default.bgcolor) : undefined,
    [property?.default?.bgcolor],
  );

  useEffect(() => {
    engineAPI.changeSceneMode(property?.default?.sceneMode, 0);
  }, [property?.default?.sceneMode, engineAPI]);

  // move to initial position at startup
  const initialCameraFlight = useRef(false);

  const handleMount = useCustomCompareCallback(
    () => {
      if (initialCameraFlight.current) return;
      initialCameraFlight.current = true;
      if (
        property?.cameraLimiter?.cameraLimitterEnabled &&
        property?.cameraLimiter?.cameraLimitterTargetArea
      ) {
        engineAPI.flyTo(property?.cameraLimiter?.cameraLimitterTargetArea, { duration: 0 });
      } else if (property?.default?.camera) {
        engineAPI.flyTo(property.default.camera, { duration: 0 });
      }
      const camera = getCamera(cesium?.current?.cesiumElement);
      if (camera) {
        onCameraChange?.(camera);
      }
    },
    [
      engineAPI,
      onCameraChange,
      property?.default?.camera,
      property?.cameraLimiter?.cameraLimitterEnabled,
    ],
    (prevDeps, nextDeps) =>
      prevDeps[0] === nextDeps[0] &&
      prevDeps[1] === nextDeps[1] &&
      isEqual(prevDeps[2], nextDeps[2]) &&
      prevDeps[3] === nextDeps[3],
  );

  const handleUnmount = useCallback(() => {
    initialCameraFlight.current = false;
  }, []);

  // cache the camera data emmited from viewer camera change
  const emittedCamera = useRef<Camera[]>([]);
  const updateCamera = useCallback(() => {
    const viewer = cesium?.current?.cesiumElement;
    if (!viewer || viewer.isDestroyed() || !onCameraChange) return;

    const c = getCamera(viewer);
    if (c && !isEqual(c, camera)) {
      emittedCamera.current?.push(c);
      // The state change is not sync now. This number is how many state updates can actually happen to be merged within one re-render.
      if (emittedCamera.current?.length > 10) {
        emittedCamera.current?.shift();
      }
      onCameraChange?.(c);
    }
  }, [camera, onCameraChange]);

  const handleCameraChange = useCallback(() => {
    updateCamera();
  }, [updateCamera]);

  const handleCameraMoveEnd = useCallback(() => {
    updateCamera();
  }, [updateCamera]);

  useEffect(() => {
    if (camera && (!emittedCamera.current || emittedCamera.current.indexOf(camera) === -1)) {
      engineAPI.flyTo(camera, { duration: 0 });
      emittedCamera.current = [];
    }
  }, [camera, engineAPI]);

  // manage layer selection
  useEffect(() => {
    const viewer = cesium.current?.cesiumElement;
    if (!viewer || viewer.isDestroyed()) return;

    const entity = findEntity(viewer, selectedLayerId);
    if (viewer.selectedEntity === entity || (entity && !isSelectable(entity))) return;
    viewer.selectedEntity = entity;
  }, [cesium, selectedLayerId]);

  const handleClick = useCallback(
    (_: CesiumMovementEvent, target: RootEventTarget) => {
      const viewer = cesium.current?.cesiumElement;
      if (!viewer || viewer.isDestroyed()) return;

      if (target && "id" in target && target.id instanceof Entity && isSelectable(target.id)) {
        onLayerSelect?.(target.id.id);
        return;
      }

      if (target && target instanceof Cesium3DTileFeature) {
        const layerId: string | undefined = (target.primitive as any)?.[layerIdField];
        if (layerId) {
          onLayerSelect?.(layerId, {
            overriddenInfobox: {
              title: target.getProperty("name"),
              content: tileProperties(target),
            },
          });
        }
        return;
      }

      onLayerSelect?.();
    },
    [onLayerSelect],
  );

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
    const viewer = cesium.current?.cesiumElement;
    if (!viewer || viewer.isDestroyed()) return;
    viewer.scene.requestRender();
  });

  // enable Drag and Drop Layers
  const handleLayerDrag = useCallback(
    (e: Entity, position: Cartesian3 | undefined, _context: Context): boolean | void => {
      const viewer = cesium.current?.cesiumElement;
      if (!viewer || viewer.isDestroyed() || !isSelectable(e) || !isDraggable(e)) return false;

      const pos = convertCartesian3ToPosition(cesium.current?.cesiumElement, position);
      if (!pos) return false;

      onLayerDrag?.(e.id, pos);
    },
    [onLayerDrag],
  );

  const handleLayerDrop = useCallback(
    (e: Entity, position: Cartesian3 | undefined): boolean | void => {
      const viewer = cesium.current?.cesiumElement;
      if (!viewer || viewer.isDestroyed()) return false;

      const key = isDraggable(e);
      const pos = convertCartesian3ToPosition(cesium.current?.cesiumElement, position);
      onLayerDrop?.(e.id, key || "", pos);

      return false; // let apollo-client handle optimistic updates
    },
    [onLayerDrop],
  );

  const cesiumDnD = useRef<CesiumDnD>();
  useEffect(() => {
    const viewer = cesium.current?.cesiumElement;
    if (!viewer || viewer.isDestroyed()) return;
    cesiumDnD.current = new CesiumDnD(viewer, {
      onDrag: handleLayerDrag,
      onDrop: handleLayerDrop,
      dragDelay: 1000,
      initialDisabled: !isLayerDraggable,
    });
    return () => {
      if (!viewer || viewer.isDestroyed()) return;
      cesiumDnD.current?.disable();
    };
  }, [handleLayerDrag, handleLayerDrop, isLayerDraggable]);
  const { limiterDimensions, cameraViewOuterBoundaries, cameraViewBoundariesMaterial } =
    useCameraLimiter(cesium, camera, property?.cameraLimiter);

  return {
    terrainProvider,
    terrainProperty,
    backgroundColor,
    imageryLayers,
    cesium,
    limiterDimensions,
    cameraViewOuterBoundaries,
    cameraViewBoundariesMaterial,
    handleMount,
    handleUnmount,
    handleClick,
    handleCameraChange,
    handleCameraMoveEnd,
  };
};

function tileProperties(t: Cesium3DTileFeature): { key: string; value: any }[] {
  return t
    .getPropertyNames()
    .reduce<{ key: string; value: any }[]>(
      (a, b) => [...a, { key: b, value: t.getProperty(b) }],
      [],
    );
}

function findEntity(viewer: CesiumViewer, layerId: string | undefined): Entity | undefined {
  let entity: Entity | undefined;
  if (layerId) {
    entity = viewer.entities.getById(layerId);
    if (!entity) {
      for (let i = 0; i < viewer.dataSources.length; i++) {
        const e = viewer.dataSources.get(i).entities.getById(layerId);
        if (e) {
          entity = e;
          break;
        }
      }
    }
  }
  return entity;
}
