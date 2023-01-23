import { useCallback, useEffect, useMemo } from "react";

import useClientStorage from "@reearth/components/molecules/Visualizer/useClientStorage";
import type { CameraPosition, NaiveLayer } from "@reearth/core/mantle";
import {
  type MouseEventHandles,
  type MouseEvents,
  events,
  useGet,
  CameraOptions,
  LookAtDestination,
  FlyToDestination,
  LayerSelectionReason,
} from "@reearth/core/Map";

import { commonReearth } from "./api";
import { ReearthEventType, Viewport, ViewportSize } from "./plugin_types";
import { Context, Props } from "./types";
import useClientStorage from "./useClientStorage";
import usePluginInstances from "./usePluginInstances";

export type SelectedReearthEventType = Pick<
  ReearthEventType,
  "cameramove" | "select" | "tick" | "resize" | keyof MouseEvents | "layeredit"
>;

export default function ({
  engineName,
  mapRef,
  sceneProperty,
  inEditor,
  tags,
  viewport,
  selectedLayer,
  layerSelectionReason,
  alignSystem,
  floatingWidgets,
  camera,
  clock,
  overrideSceneProperty,
  onLayerEdit,
}: Props) {
  const [ev, emit] = useMemo(() => events<SelectedReearthEventType>(), []);

  const layersRef = mapRef?.current?.layers;
  const engineRef = mapRef?.current?.engine;

  const pluginInstances = usePluginInstances({
    alignSystem,
    floatingWidgets,
    blocks: selectedLayer?.layer?.infobox?.blocks,
  });
  const clientStorage = useClientStorage();

  const getLayers = useGet(layersRef);
  const getSceneProperty = useGet(sceneProperty);
  const getInEditor = useGet(!!inEditor);
  const getTags = useGet(tags ?? []);
  const getCamera = useGet(camera);
  const getClock = useGet({
    startTime: clock?.start,
    stopTime: clock?.stop,
    currentTime: clock?.current,
    playing: clock?.playing,
    paused: !clock?.playing,
    speed: clock?.speed,
    play: engineRef?.play,
    pause: engineRef?.pause,
    tick: engineRef?.tick,
  });
  const getPluginInstances = useGet(pluginInstances);
  const getViewport = useGet(viewport as Viewport);
  const getSelectedLayer = useGet(selectedLayer);
  const getLayerSelectionReason = useGet(layerSelectionReason);
  const overrideScenePropertyCommon = useCallback(
    (property: any) => {
      return overrideSceneProperty("", property);
    },
    [overrideSceneProperty],
  );

  const flyTo = useCallback(
    (dest: FlyToDestination, options?: CameraOptions) => {
      engineRef?.flyTo(dest, options);
    },
    [engineRef],
  );

  const lookAt = useCallback(
    (dest: LookAtDestination, options?: CameraOptions) => {
      engineRef?.lookAt(dest, options);
    },
    [engineRef],
  );

  const cameraViewport = useCallback(() => {
    return engineRef?.getViewport();
  }, [engineRef]);

  const layersInViewport = useCallback(() => {
    return layersRef?.findAll(layer => !!engineRef?.inViewport(layer?.property?.default?.location));
  }, [engineRef, layersRef]);

  const zoomIn = useCallback(
    (amount: number) => {
      engineRef?.zoomIn(amount);
    },
    [engineRef],
  );

  const zoomOut = useCallback(
    (amount: number) => {
      engineRef?.zoomOut(amount);
    },
    [engineRef],
  );

  const rotateRight = useCallback(
    (radian: number) => {
      engineRef?.rotateRight(radian);
    },
    [engineRef],
  );

  const orbit = useCallback(
    (radian: number) => {
      engineRef?.orbit(radian);
    },
    [engineRef],
  );

  const captureScreen = useCallback(
    (type?: string, encoderOptions?: number) => {
      return engineRef?.captureScreen(type, encoderOptions);
    },
    [engineRef],
  );

  const getLocationFromScreen = useCallback(
    (x: number, y: number, withTerrain?: boolean) => {
      return engineRef?.getLocationFromScreen(x, y, withTerrain);
    },
    [engineRef],
  );

  const enableScreenSpaceCameraController = useCallback(
    (enabled: boolean) => engineRef?.enableScreenSpaceCameraController(enabled),
    [engineRef],
  );

  const lookHorizontal = useCallback(
    (amount: number) => {
      engineRef?.lookHorizontal(amount);
    },
    [engineRef],
  );

  const lookVertical = useCallback(
    (amount: number) => {
      engineRef?.lookVertical(amount);
    },
    [engineRef],
  );

  const moveForward = useCallback(
    (amount: number) => {
      engineRef?.moveForward(amount);
    },
    [engineRef],
  );

  const moveBackward = useCallback(
    (amount: number) => {
      engineRef?.moveBackward(amount);
    },
    [engineRef],
  );

  const moveUp = useCallback(
    (amount: number) => {
      engineRef?.moveUp(amount);
    },
    [engineRef],
  );

  const moveDown = useCallback(
    (amount: number) => {
      engineRef?.moveDown(amount);
    },
    [engineRef],
  );

  const moveLeft = useCallback(
    (amount: number) => {
      engineRef?.moveLeft(amount);
    },
    [engineRef],
  );

  const moveRight = useCallback(
    (amount: number) => {
      engineRef?.moveRight(amount);
    },
    [engineRef],
  );

  const moveOverTerrain = useCallback(
    (offset?: number) => {
      return engineRef?.moveOverTerrain(offset);
    },
    [engineRef],
  );

  const flyToGround = useCallback(
    (dest: FlyToDestination, options?: CameraOptions, offset?: number) => {
      engineRef?.flyToGround(dest, options, offset);
    },
    [engineRef],
  );

  const addLayer = useCallback(
    (layer: NaiveLayer) => {
      return layersRef?.add(layer)?.id;
    },
    [layersRef],
  );

  const overrideLayerProperty = useCallback(
    (id: string, properties?: Partial<any> | null | undefined) => {
      layersRef?.override(id, properties);
    },
    [layersRef],
  );

  const selectLayer = useCallback(
    (
      layerId: string | undefined,
      featureId?: string | undefined,
      reason?: LayerSelectionReason | undefined,
    ) => {
      layersRef?.select(layerId, featureId, reason);
    },
    [layersRef],
  );

  const showLayer = useCallback(
    (...args: string[]) => {
      layersRef?.show(...args);
    },
    [layersRef],
  );

  const hideLayer = useCallback(
    (...args: string[]) => {
      layersRef?.hide(...args);
    },
    [layersRef],
  );

  const layerOverriddenProperties = useCallback(() => {
    return layersRef?.overriddenLayers();
  }, [layersRef]);

  const value = useMemo<Context>(
    () => ({
      reearth: commonReearth({
        engineName,
        events: ev,
        layers: getLayers,
        sceneProperty: getSceneProperty,
        inEditor: getInEditor,
        tags: getTags,
        camera: getCamera,
        clock: getClock,
        pluginInstances: getPluginInstances,
        viewport: getViewport,
        selectedLayer: getSelectedLayer,
        layerSelectionReason: getLayerSelectionReason,
        layerOverriddenProperties,
        showLayer,
        hideLayer,
        addLayer,
        selectLayer,
        overrideLayerProperty,
        overrideSceneProperty: overrideScenePropertyCommon,
        layersInViewport,
        flyTo,
        lookAt,
        zoomIn,
        zoomOut,
        cameraViewport,
        rotateRight,
        orbit,
        captureScreen,
        getLocationFromScreen,
        enableScreenSpaceCameraController,
        lookHorizontal,
        lookVertical,
        moveForward,
        moveBackward,
        moveUp,
        moveDown,
        moveLeft,
        moveRight,
        moveOverTerrain,
        flyToGround,
      }),
      overrideSceneProperty,
      pluginInstances,
      clientStorage,
    }),
    [
      engineName,
      ev,
      getLayers,
      getSceneProperty,
      getInEditor,
      getTags,
      getCamera,
      getClock,
      getPluginInstances,
      getViewport,
      getSelectedLayer,
      getLayerSelectionReason,
      overrideScenePropertyCommon,
      lookAt,
      layersInViewport,
      pluginInstances,
      clientStorage,
      overrideSceneProperty,
      addLayer,
      cameraViewport,
      captureScreen,
      enableScreenSpaceCameraController,
      flyTo,
      flyToGround,
      getLocationFromScreen,
      hideLayer,
      lookHorizontal,
      lookVertical,
      moveBackward,
      moveDown,
      moveForward,
      moveLeft,
      moveOverTerrain,
      moveRight,
      moveUp,
      orbit,
      overrideLayerProperty,
      rotateRight,
      selectLayer,
      showLayer,
      zoomIn,
      zoomOut,
      layerOverriddenProperties,
    ],
  );

  useEmit<SelectedReearthEventType>(
    {
      select: useMemo<[layerId: string | undefined]>(
        () => (selectedLayer ? [selectedLayer.id] : [undefined]),
        [selectedLayer],
      ),
      cameramove: useMemo<[camera: CameraPosition] | undefined>(
        () => (camera ? [camera] : undefined),
        [camera],
      ),
      tick: useMemo<[date: Date] | undefined>(() => {
        return clock ? [clock.current] : undefined;
      }, [clock]),
      resize: useMemo<[viewport: ViewportSize] | undefined>(
        () => [
          {
            width: viewport?.width,
            height: viewport?.height,
            isMobile: viewport?.isMobile,
          } as ViewportSize,
        ],
        [viewport?.width, viewport?.height, viewport?.isMobile],
      ),
    },
    emit,
  );

  const onMouseEvent = useCallback(
    (eventType: keyof MouseEventHandles, fn: any) => {
      mapRef?.current?.engine[eventType]?.(fn);
    },
    [mapRef],
  );

  useEffect(() => {
    const eventHandles: {
      [index in keyof MouseEvents]: keyof MouseEventHandles;
    } = {
      click: "onClick",
      doubleclick: "onDoubleClick",
      mousedown: "onMouseDown",
      mouseup: "onMouseUp",
      rightclick: "onRightClick",
      rightdown: "onRightDown",
      rightup: "onRightUp",
      middleclick: "onMiddleClick",
      middledown: "onMiddleDown",
      middleup: "onMiddleUp",
      mousemove: "onMouseMove",
      mouseenter: "onMouseEnter",
      mouseleave: "onMouseLeave",
      wheel: "onWheel",
    };
    (Object.keys(eventHandles) as (keyof MouseEvents)[]).forEach((event: keyof MouseEvents) => {
      onMouseEvent(eventHandles[event], (props: MouseEvent) => {
        emit(event, props);
      });
    });
    onLayerEdit(e => {
      emit("layeredit", e);
    });
  }, [emit, onMouseEvent, onLayerEdit]);

  // expose plugin API for developers
  useEffect(() => {
    window.reearth = value.reearth;
    return () => {
      delete window.reearth;
    };
  }, [value]);

  return value;
}

export function useEmit<T extends { [K in string]: any[] }>(
  values: { [K in keyof T]?: T[K] | undefined },
  emit: (<K extends keyof T>(key: K, ...args: T[K]) => void) | undefined,
) {
  for (const k of Object.keys(values)) {
    const args = values[k];
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (!args) return;
      emit?.(k, ...args);
    }, [emit, k, args]);
  }
}
