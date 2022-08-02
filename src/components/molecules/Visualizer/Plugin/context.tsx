import { Clock } from "cesium";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext as useReactContext,
  useEffect,
  useMemo,
} from "react";

import events from "@reearth/util/event";
import { Rect } from "@reearth/util/value";

import type { LayerStore } from "../Layers";
import type { Component as PrimitiveComponent } from "../Primitive";
import { useGet } from "../utils";

import type { CommonReearth } from "./api";
import { commonReearth } from "./api";
import type {
  CameraPosition,
  Layer,
  OverriddenInfobox,
  ReearthEventType,
  FlyToDestination,
  LookAtDestination,
  Tag,
} from "./types";

export type EngineContext = {
  api?: any;
  builtinPrimitives?: Record<string, PrimitiveComponent>;
};

export type Props = {
  children?: ReactNode;
  engine: EngineContext;
  engineName: string;
  sceneProperty?: any;
  tags?: Tag[];
  camera?: CameraPosition;
  clock: () => Clock | undefined;
  layers: LayerStore;
  selectedLayer?: Layer;
  layerSelectionReason?: string;
  layerOverridenInfobox?: OverriddenInfobox;
  layerOverriddenProperties?: { [key: string]: any };
  showLayer: (...id: string[]) => void;
  hideLayer: (...id: string[]) => void;
  addLayer: (layer: Layer, parentId?: string, creator?: string) => string | undefined;
  selectLayer: (id?: string, options?: { reason?: string }) => void;
  overrideLayerProperty: (id: string, property: any) => void;
  overrideSceneProperty: (id: string, property: any) => void;
  flyTo: (dest: FlyToDestination) => void;
  lookAt: (dest: LookAtDestination) => void;
  zoomIn: (amount: number) => void;
  zoomOut: (amount: number) => void;
  layersInViewport: () => Layer[];
  viewport: () => Rect | undefined;
};

export type Context = {
  reearth: CommonReearth;
  engine: EngineContext;
  overrideSceneProperty: (id: string, property: any) => void;
};

export const context = createContext<Context | undefined>(undefined);
export const useContext = (): Context | undefined => useReactContext(context);

declare global {
  interface Window {
    reearth?: CommonReearth;
  }
}

export function Provider({
  engine: { api, builtinPrimitives },
  engineName,
  sceneProperty,
  tags,
  camera,
  clock,
  layers,
  selectedLayer,
  layerSelectionReason,
  layerOverridenInfobox,
  layerOverriddenProperties,
  showLayer,
  hideLayer,
  addLayer,
  selectLayer,
  overrideLayerProperty,
  overrideSceneProperty,
  layersInViewport,
  flyTo,
  lookAt,
  zoomIn,
  zoomOut,
  viewport,
  children,
}: Props): JSX.Element {
  const [ev, emit] = useMemo(
    () => events<Pick<ReearthEventType, "cameramove" | "select">>(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [engineName],
  );

  const getLayers = useGet(layers);
  const getSceneProperty = useGet(sceneProperty);
  const getTags = useGet(tags ?? []);
  const getCamera = useGet(camera);
  const getSelectedLayer = useGet(selectedLayer);
  const getLayerSelectionReason = useGet(layerSelectionReason);
  const getLayerOverriddenInfobox = useGet(layerOverridenInfobox);
  const getLayerOverriddenProperties = useGet(layerOverriddenProperties);
  const overrideScenePropertyCommon = useCallback(
    (property: any) => {
      return overrideSceneProperty("", property);
    },
    [overrideSceneProperty],
  );

  const value = useMemo<Context>(
    () => ({
      engine: {
        api,
        builtinPrimitives,
      },
      reearth: commonReearth({
        engineName,
        events: ev,
        layers: getLayers,
        sceneProperty: getSceneProperty,
        tags: getTags,
        camera: getCamera,
        clock,
        selectedLayer: getSelectedLayer,
        layerSelectionReason: getLayerSelectionReason,
        layerOverriddenInfobox: getLayerOverriddenInfobox,
        layerOverriddenProperties: getLayerOverriddenProperties,
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
        viewport,
      }),
      overrideSceneProperty,
    }),
    [
      api,
      builtinPrimitives,
      engineName,
      ev,
      getLayers,
      getSceneProperty,
      getTags,
      getCamera,
      clock,
      getSelectedLayer,
      getLayerSelectionReason,
      getLayerOverriddenInfobox,
      getLayerOverriddenProperties,
      showLayer,
      hideLayer,
      selectLayer,
      addLayer,
      overrideLayerProperty,
      overrideSceneProperty,
      overrideScenePropertyCommon,
      layersInViewport,
      flyTo,
      lookAt,
      zoomIn,
      zoomOut,
      viewport,
    ],
  );

  useEmit<Pick<ReearthEventType, "cameramove" | "select">>(
    {
      select: useMemo<[layerId: string | undefined]>(
        () => (selectedLayer ? [selectedLayer.id] : [undefined]),
        [selectedLayer],
      ),
      cameramove: useMemo<[camera: CameraPosition] | undefined>(
        () => (camera ? [camera] : undefined),
        [camera],
      ),
    },
    emit,
  );

  // expose plugin API for developers
  useEffect(() => {
    window.reearth = value.reearth;
    return () => {
      delete window.reearth;
    };
  }, [value.reearth]);

  return <context.Provider value={value}>{children}</context.Provider>;
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
