import {
  createWorldTerrain,
  Color,
  Entity,
  Ion,
  EllipsoidTerrainProvider,
  Cesium3DTileFeature,
  Cartesian3,
  Math,
} from "cesium";
import type { Viewer as CesiumViewer, ImageryProvider, TerrainProvider } from "cesium";
import CesiumDnD, { Context } from "cesium-dnd";
import { isEqual } from "lodash-es";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useDeepCompareEffect } from "react-use";
import type { CesiumComponentRef, CesiumMovementEvent, RootEventTarget } from "resium";

import { Camera, LatLng } from "@reearth/util/value";

import type { SelectLayerOptions, Ref as EngineRef, SceneProperty } from "..";

import { getCamera, isDraggable, isSelectable, layerIdField } from "./common";
import imagery from "./imagery";
import useEngineRef from "./useEngineRef";
import { convertCartesian3ToPosition } from "./utils";

import { Box } from ".";

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

  const box: Box = {
    box_x: property?.cameraLimiter?.box_x || -100.0,
    box_y: property?.cameraLimiter?.box_y || 45.0,
    box_z: property?.cameraLimiter?.box_z || 300000,
    box_width: property?.cameraLimiter?.box_width || 300000,
    box_length: property?.cameraLimiter?.box_length || 1000000,
    box_height: property?.cameraLimiter?.box_height || 500000,
  };

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
          type ? (url ? imagery[type](url) : imagery[type]()) : null,
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

  const handleMount = useCallback(() => {
    if (initialCameraFlight.current) return;
    initialCameraFlight.current = true;
    if (property?.default?.camera) {
      engineAPI.flyTo(property.default.camera, { duration: 0 });
    }
    const camera = getCamera(cesium?.current?.cesiumElement);
    if (camera) {
      onCameraChange?.(camera);
    }
  }, [engineAPI, onCameraChange, property?.default?.camera]);

  const handleUnmount = useCallback(() => {
    initialCameraFlight.current = false;
  }, []);

  // call onCameraChange event after moving camera
  const emittedCamera = useRef<Camera>();
  const handleCameraMoveEnd = useCallback(() => {
    const viewer = cesium?.current?.cesiumElement;
    if (!viewer || viewer.isDestroyed() || !onCameraChange) return;

    const c = getCamera(viewer);
    if (c && !isEqual(c, camera)) {
      emittedCamera.current = c;
      onCameraChange(c);
    }
  }, [onCameraChange, camera]);

  // camera
  useEffect(() => {
    if (camera && (!emittedCamera.current || emittedCamera.current !== camera)) {
      engineAPI.flyTo(camera, { duration: 0 });
      emittedCamera.current = undefined;
    }
  }, [camera, engineAPI]);

  // manage layer selection
  useEffect(() => {
    const viewer = cesium.current?.cesiumElement;
    if (!viewer || viewer.isDestroyed()) return;

    const entity = selectedLayerId ? viewer.entities.getById(selectedLayerId) : undefined;
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

  useEffect(() => {
    const camera = getCamera(cesium?.current?.cesiumElement);
    const viewer = cesium?.current?.cesiumElement;
    if (
      !viewer ||
      viewer.isDestroyed() ||
      !onCameraChange ||
      !property?.cameraLimiter?.enable_camera_limiter
    )
      return;
    const centerForAxisAligned = Cartesian3.fromDegrees(box.box_x, box.box_y, box.box_z);
    const dimensionsForAxisAligned = new Cartesian3(box.box_width, box.box_length, box.box_height);
    const halfDimensionsAxisAligned = Cartesian3.multiplyByScalar(
      dimensionsForAxisAligned,
      0.5,
      new Cartesian3(),
    );

    if (camera) {
      const cameraPosition = Cartesian3.fromDegrees(camera?.lng, camera?.lat, camera?.height);
      const minPos = new Cartesian3();
      Cartesian3.subtract(centerForAxisAligned, halfDimensionsAxisAligned, minPos);
      const maxPos = new Cartesian3();
      Cartesian3.add(centerForAxisAligned, halfDimensionsAxisAligned, maxPos);
      const destination = new Cartesian3(
        Math.clamp(cameraPosition.x, minPos.x, maxPos.x),
        Math.clamp(cameraPosition.y, minPos.y, maxPos.y),
        Math.clamp(cameraPosition.z, minPos.z, maxPos.z),
      );
      viewer.camera.flyTo({
        destination,
        orientation: {
          heading: viewer.camera.heading,
          pitch: viewer.camera.pitch,
          roll: viewer.camera.roll,
          up: viewer.camera.up,
        },
        duration: 1,
      });
    }
  }, [camera, onCameraChange, engineAPI, property?.cameraLimiter]);

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

  return {
    terrainProvider,
    backgroundColor,
    imageryLayers,
    cesium,
    box,
    handleMount,
    handleUnmount,
    handleClick,
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
