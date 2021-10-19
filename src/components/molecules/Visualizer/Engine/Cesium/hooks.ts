import {
  createWorldTerrain,
  Color,
  Entity,
  Ion,
  EllipsoidTerrainProvider,
  Cesium3DTileFeature,
  Cartesian3,
} from "cesium";
import type { Viewer as CesiumViewer, ImageryProvider, TerrainProvider } from "cesium";
import CesiumDnD, { Context } from "cesium-dnd";
import { isEqual } from "lodash-es";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useDeepCompareEffect } from "react-use";
import type { CesiumComponentRef, CesiumMovementEvent, RootEventTarget } from "resium";

import { Camera, LatLng } from "@reearth/util/value";

import type { SelectLayerOptions, Ref as EngineRef, SceneProperty } from "..";

import { getCamera, layerIdField } from "./common";
import imagery from "./imagery";
import useEngineRef from "./useEngineRef";
import { convertCartesian3ToPosition } from "./utils";

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
  onLayerDrop?: (layerId: string, position: LatLng) => void;
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
    if (viewer.selectedEntity === entity || (entity && !selectable(entity))) return;

    viewer.selectedEntity = entity;
  }, [cesium, selectedLayerId]);

  const handleClick = useCallback(
    (_: CesiumMovementEvent, target: RootEventTarget) => {
      const viewer = cesium.current?.cesiumElement;
      if (!viewer || viewer.isDestroyed()) return;

      if (target && "id" in target && target.id instanceof Entity && selectable(target.id)) {
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
      if (!viewer || viewer.isDestroyed()) return;
      const pos = convertCartesian3ToPosition(cesium.current?.cesiumElement, position);
      if (!pos) return;
      onLayerDrag?.(e.id, pos);
    },
    [onLayerDrag],
  );

  useEffect(() => {
    console.log("onLayerDrop", onLayerDrop);
  }, [onLayerDrop]);

  const handleLayerDrop = useCallback(
    (e: Entity, position: Cartesian3 | undefined): boolean | void => {
      const viewer = cesium.current?.cesiumElement;
      if (!viewer || viewer.isDestroyed()) return;
      const pos = convertCartesian3ToPosition(cesium.current?.cesiumElement, position);
      if (!pos) return;
      onLayerDrop?.(e.id, pos);
      // if (cesium.current?.cesiumElement?.scene.screenSpaceCameraController) {
      //   cesium.current.cesiumElement.scene.screenSpaceCameraController.enableRotate = true;
      // }
    },
    [onLayerDrop],
  );

  const cesiumDnD = useRef<CesiumDnD>();
  useEffect(() => {
    console.log("CesiumDND", handleLayerDrag, handleLayerDrop);
    const viewer = cesium.current?.cesiumElement;
    if (!viewer || viewer.isDestroyed()) return;
    cesiumDnD.current = new CesiumDnD(viewer, {
      onDrag: handleLayerDrag,
      onDrop: handleLayerDrop,
      dragDelay: 1000,
      initialDisabled: !isLayerDraggable,
    });
    return () => {
      cesiumDnD.current?.disable();
    };
  }, [handleLayerDrag, handleLayerDrop, isLayerDraggable]);

  return {
    terrainProvider,
    backgroundColor,
    imageryLayers,
    cesium,
    handleMount,
    handleUnmount,
    handleClick,
    handleCameraMoveEnd,
  };
};

const tag = "reearth_unselectable";
const selectable = (e: Entity | undefined) => {
  if (!e) return false;
  const p = e.properties;
  return !p || !p.hasProperty(tag);
};

function tileProperties(t: Cesium3DTileFeature): { key: string; value: any }[] {
  return t
    .getPropertyNames()
    .reduce<{ key: string; value: any }[]>(
      (a, b) => [...a, { key: b, value: t.getProperty(b) }],
      [],
    );
}
