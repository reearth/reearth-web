import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useDeepCompareEffect } from "react-use";
import {
  createWorldTerrain,
  Color,
  Entity,
  Ion,
  EllipsoidTerrainProvider,
  Math as CesiumMath,
  Cartesian3,
} from "cesium";
import { isEqual } from "lodash-es";
import type { CesiumComponentRef, CesiumMovementEvent } from "resium";
import type { Viewer as CesiumViewer, ImageryProvider, TerrainProvider } from "cesium";

import { Camera, LatLngHeight } from "@reearth/util/value";

import type { Ref as EngineRef, SceneProperty } from "..";
import tiles from "./tiles";
import useEngineRef from "./useEngineRef";
import { getCamera } from "./common";
import CesiumDnD, { Context } from "cesium-dnd";

export default ({
  ref,
  property,
  camera,
  selectedPrimitiveId,
  onPrimitiveSelect,
  onCameraChange,
  isLayerDraggable,
  onDragLayer,
  onDraggingLayer,
  onDropLayer,
}: {
  ref: React.ForwardedRef<EngineRef>;
  property?: SceneProperty;
  camera?: Camera;
  selectedPrimitiveId?: string;
  onPrimitiveSelect?: (id?: string) => void;
  onCameraChange?: (camera: Camera) => void;
  isLayerDraggable?: boolean;
  onDragLayer?: (layerId: string, position: LatLngHeight | undefined) => void;
  onDraggingLayer?: (layerId: string, position: LatLngHeight | undefined) => void;
  onDropLayer?: (layerId: string, position: LatLngHeight | undefined) => void;
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
  const engineAPI = useEngineRef(ref, cesium);

  // imagery layers
  const [imageryLayers, setImageryLayers] =
    useState<[string, ImageryProvider, number | undefined, number | undefined][]>();

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
  const initialCameraFlight = useRef(false);

  useEffect(() => {
    if (!property?.default?.camera || initialCameraFlight.current) return;
    initialCameraFlight.current = true;
    engineAPI.flyTo(property.default.camera, { duration: 0 });
  }, [engineAPI, property?.default?.camera]);

  useEffect(() => {
    if (initialCameraFlight.current && !property) {
      initialCameraFlight.current = false;
    }
  }, [property]);

  // call onCameraChange event after moving camera
  const onCameraMoveEnd = useCallback(() => {
    const viewer = cesium?.current?.cesiumElement;
    if (!viewer || viewer.isDestroyed()) return;

    const c = getCamera(viewer);
    if (c && !isEqual(c, camera)) {
      onCameraChange?.(c);
    }
  }, [onCameraChange, camera]);

  // manage layer selection
  useEffect(() => {
    const viewer = cesium.current?.cesiumElement;
    if (!viewer || viewer.isDestroyed()) return;

    const entity = selectedPrimitiveId ? viewer.entities.getById(selectedPrimitiveId) : undefined;
    if (viewer.selectedEntity === entity || (entity && !selectable(entity))) return;

    viewer.selectedEntity = entity;
  }, [cesium, selectedPrimitiveId]);

  const selectViewerEntity = useCallback(
    (_: CesiumMovementEvent, target: any) => {
      const viewer = cesium.current?.cesiumElement;
      if (
        !viewer ||
        viewer.isDestroyed() ||
        viewer.selectedEntity === target ||
        (target && !selectable(target))
      )
        return;
      onPrimitiveSelect?.(target?.id);
    },
    [cesium, onPrimitiveSelect],
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

  const handleDragLayer = useCallback(
    (e: Entity, position: Cartesian3 | undefined, _context: Context): boolean | void => {
      onDragLayer?.(e.id, convertCartesian3ToPosition(position));
    },
    [onDragLayer],
  );

  const handleDraggingLayer = useCallback(
    (e: Entity, position: Cartesian3 | undefined, _context: Context): false | void => {
      onDraggingLayer?.(e.id, convertCartesian3ToPosition(position));
    },
    [onDraggingLayer],
  );

  const handleDropLayer = useCallback(
    (e: Entity, position: Cartesian3 | undefined, _context: Context): boolean | void => {
      onDropLayer?.(e.id, convertCartesian3ToPosition(position));
      //TODO: remove here since cesium-dnd must take care of this
      if (cesium.current?.cesiumElement?.scene.screenSpaceCameraController) {
        cesium.current.cesiumElement.scene.screenSpaceCameraController.enableRotate = true;
      }
    },
    [onDropLayer],
  );

  const convertCartesian3ToPosition = (
    pos?: Cartesian3,
  ): { lat: number; lng: number; height: number } | undefined => {
    if (!pos) return;
    const cartographic =
      cesium.current?.cesiumElement?.scene.globe.ellipsoid.cartesianToCartographic(pos);
    if (!cartographic) return;
    return {
      lat: CesiumMath.toDegrees(cartographic.latitude),
      lng: CesiumMath.toDegrees(cartographic.longitude),
      height: cartographic.height,
    };
  };

  //Enable Drag and Drop Layers
  const DELAY = 100;
  useEffect(() => {
    const viewer = cesium.current?.cesiumElement;
    if (!viewer || !isLayerDraggable) return;
    new CesiumDnD(viewer, {
      onDrag: handleDragLayer,
      onDrop: handleDropLayer,
      onDragging: handleDraggingLayer,
      dragDelay: DELAY,
    });
  }, [handleDragLayer, handleDraggingLayer, handleDropLayer, isLayerDraggable]);

  return {
    terrainProvider,
    backgroundColor,
    imageryLayers,
    cesium,
    selectViewerEntity,
    onCameraMoveEnd,
  };
};

const tag = "reearth_unselectable";
const selectable = (e: Entity | undefined) => {
  if (!e) return false;
  const p = e.properties;
  return !p || !p.hasProperty(tag);
};
