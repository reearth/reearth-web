import { Color, Entity, Ion, Cesium3DTileFeature, Cartesian3, Clock as CesiumClock } from "cesium";
import type { Viewer as CesiumViewer, TerrainProvider } from "cesium";
import CesiumDnD, { Context } from "cesium-dnd";
import { isEqual } from "lodash-es";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CesiumComponentRef, CesiumMovementEvent, RootEventTarget } from "resium";
import { useCustomCompareCallback } from "use-custom-compare";

import { e2eAccessToken, setE2ECesiumViewer } from "@reearth/config";
import { Camera, LatLng } from "@reearth/util/value";

import type { SelectLayerOptions, Ref as EngineRef, SceneProperty } from "..";
import { Clock } from "../../Plugin/types";
import { MouseEvent, MouseEvents } from "../ref";

import { useCameraLimiter } from "./cameraLimiter";
import { getCamera, getLocationFromScreenXY, getClock } from "./common";
import { getTag } from "./Feature/utils";
import terrain from "./terrain";
import useEngineRef from "./useEngineRef";
import { convertCartesian3ToPosition } from "./utils";

const cesiumIonDefaultAccessToken = Ion.defaultAccessToken;

export default ({
  ref,
  property,
  camera,
  clock,
  selectedLayerId,
  onLayerSelect,
  onCameraChange,
  onTick,
  isLayerDraggable,
  onLayerDrag,
  onLayerDrop,
}: {
  ref: React.ForwardedRef<EngineRef>;
  property?: SceneProperty;
  camera?: Camera;
  clock?: Clock;
  selectedLayerId?: string;
  onLayerSelect?: (id?: string, options?: SelectLayerOptions) => void;
  onCameraChange?: (camera: Camera) => void;
  onTick?: (clock: Clock) => void;
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
      const clock = getClock(cesium?.current?.cesiumElement?.clock);
      if (clock) {
        onTick?.(clock);
      }
    },
    [
      engineAPI,
      onCameraChange,
      onTick,
      property?.default?.camera,
      property?.cameraLimiter?.cameraLimitterEnabled,
    ],
    (prevDeps, nextDeps) =>
      prevDeps[0] === nextDeps[0] &&
      prevDeps[1] === nextDeps[1] &&
      prevDeps[2] === nextDeps[2] &&
      isEqual(prevDeps[3], nextDeps[3]) &&
      prevDeps[4] === nextDeps[4],
  );

  const handleUnmount = useCallback(() => {
    initialCameraFlight.current = false;
  }, []);

  // cache the camera data emitted from viewer camera change
  const emittedCamera = useRef<Camera[]>([]);
  const updateCamera = useCallback(() => {
    const viewer = cesium?.current?.cesiumElement;
    if (!viewer || viewer.isDestroyed() || !onCameraChange) return;

    const c = getCamera(viewer);
    if (c && !isEqual(c, camera)) {
      emittedCamera.current.push(c);
      // The state change is not sync now. This number is how many state updates can actually happen to be merged within one re-render.
      if (emittedCamera.current.length > 10) {
        emittedCamera.current.shift();
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

  const handleTick = useCallback(
    (cesiumClock: CesiumClock) => {
      const nextClock = getClock(cesiumClock);
      if (isEqual(clock, nextClock) || !nextClock) {
        return;
      }
      onTick?.(nextClock);
    },
    [clock, onTick],
  );

  useEffect(() => {
    if (camera && !emittedCamera.current.includes(camera)) {
      engineAPI.flyTo(camera, { duration: 0 });
      emittedCamera.current = [];
    }
  }, [camera, engineAPI]);

  // manage layer selection
  useEffect(() => {
    const viewer = cesium.current?.cesiumElement;
    if (!viewer || viewer.isDestroyed()) return;

    const entity = findEntity(viewer, selectedLayerId);
    if (viewer.selectedEntity === entity) return;

    const tag = getTag(entity);
    if (tag?.unselectable) return;

    viewer.selectedEntity = entity;
  }, [cesium, selectedLayerId]);

  const handleMouseEvent = useCallback(
    (type: keyof MouseEvents, e: CesiumMovementEvent, target: RootEventTarget) => {
      if (engineAPI.mouseEventCallbacks[type]) {
        const viewer = cesium.current?.cesiumElement;
        if (!viewer || viewer.isDestroyed()) return;
        const position = e.position || e.startPosition;
        const props: MouseEvent = {
          x: position?.x,
          y: position?.y,
          ...(position ? getLocationFromScreenXY(viewer.scene, position.x, position.y) ?? {} : {}),
        };
        const layerId = getLayerId(target);
        if (layerId) props.layerId = layerId;
        engineAPI.mouseEventCallbacks[type]?.(props);
      }
    },
    [engineAPI],
  );

  const handleMouseWheel = useCallback(
    (delta: number) => {
      engineAPI.mouseEventCallbacks.wheel?.({ delta });
    },
    [engineAPI],
  );

  const mouseEventHandles = useMemo(() => {
    const mouseEvents: { [index in keyof MouseEvents]: undefined | any } = {
      click: undefined,
      doubleclick: undefined,
      mousedown: undefined,
      mouseup: undefined,
      rightclick: undefined,
      rightdown: undefined,
      rightup: undefined,
      middleclick: undefined,
      middledown: undefined,
      middleup: undefined,
      mousemove: undefined,
      mouseenter: undefined,
      mouseleave: undefined,
      wheel: undefined,
    };
    (Object.keys(mouseEvents) as (keyof MouseEvents)[]).forEach(type => {
      mouseEvents[type] =
        type === "wheel"
          ? (delta: number) => {
              handleMouseWheel(delta);
            }
          : (e: CesiumMovementEvent, target: RootEventTarget) => {
              handleMouseEvent(type as keyof MouseEvents, e, target);
            };
    });
    return mouseEvents;
  }, [handleMouseEvent, handleMouseWheel]);

  const handleClick = useCallback(
    (_: CesiumMovementEvent, target: RootEventTarget) => {
      mouseEventHandles.click?.(_, target);
      const viewer = cesium.current?.cesiumElement;
      if (!viewer || viewer.isDestroyed()) return;

      if (
        target &&
        "id" in target &&
        target.id instanceof Entity &&
        !getTag(target.id)?.unselectable
      ) {
        onLayerSelect?.(target.id.id);
        return;
      }

      if (target && target instanceof Cesium3DTileFeature) {
        const layerId = getTag(target.tileset)?.layerId;
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
    [onLayerSelect, mouseEventHandles],
  );

  // E2E test
  useEffect(() => {
    if (e2eAccessToken()) {
      setE2ECesiumViewer(cesium.current?.cesiumElement);
      return () => {
        setE2ECesiumViewer(undefined);
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

  // DnD
  const [isLayerDragging, setLayerDragging] = useState(false);

  useEffect(() => {
    const viewer = cesium.current?.cesiumElement;
    if (!viewer || viewer.isDestroyed() || !isLayerDraggable) return;

    const cesiumDnD = new CesiumDnD(viewer, {
      onDrag: (e: Entity, position: Cartesian3 | undefined, _context: Context): boolean | void => {
        if (viewer.isDestroyed()) return;

        const tag = getTag(e);
        if (!tag?.draggable || tag.unselectable || !tag.layerId) return false;

        const pos = convertCartesian3ToPosition(viewer, position);
        if (!pos) return false;

        setLayerDragging(true);
        onLayerDrag?.(e.id, pos);
      },
      onDrop: (e: Entity, position: Cartesian3 | undefined): boolean | void => {
        setLayerDragging(false);
        if (viewer.isDestroyed()) return;

        const tag = getTag(e);
        if (!tag?.draggable || !tag.layerId) return false;

        const pos = convertCartesian3ToPosition(cesium.current?.cesiumElement, position);
        onLayerDrop?.(tag.layerId, tag.legacyLocationPropertyKey || "default.location", pos);

        return false; // let apollo-client handle optimistic updates
      },
      dragDelay: 500,
    });

    return () => {
      if (viewer.isDestroyed()) return;
      cesiumDnD.disable();
      setLayerDragging(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cesium.current?.cesiumElement, isLayerDraggable, onLayerDrag, onLayerDrop]);

  const { cameraViewBoundaries, cameraViewOuterBoundaries, cameraViewBoundariesMaterial } =
    useCameraLimiter(cesium, camera, property?.cameraLimiter);

  return {
    terrainProvider,
    terrainProperty,
    backgroundColor,
    cesium,
    cameraViewBoundaries,
    cameraViewOuterBoundaries,
    cameraViewBoundariesMaterial,
    mouseEventHandles,
    isLayerDragging,
    handleMount,
    handleUnmount,
    handleClick,
    handleCameraChange,
    handleTick,
    handleCameraMoveEnd,
  };
};

function tileProperties(t: Cesium3DTileFeature): { key: string; value: any }[] {
  return t
    .getPropertyIds()
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

function getLayerId(target: RootEventTarget): string | undefined {
  if (target && "id" in target && target.id instanceof Entity) {
    return getTag(target.id)?.layerId;
  } else if (target && target instanceof Cesium3DTileFeature) {
    return getTag(target.tileset)?.layerId;
  }
  return undefined;
}
