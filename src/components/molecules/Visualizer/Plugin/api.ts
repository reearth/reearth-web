import { useMemo, useCallback, useRef, useEffect } from "react";

import type { IFrameAPI } from "@reearth/components/atoms/Plugin";
import events from "@reearth/util/event";
import type { Events, EventEmitter } from "@reearth/util/event";

import type { VisualizerContext } from "..";

import type { GlobalThis, Block, Layer, Widget, ReearthEventType, Reearth } from "./types";

export type CommonReearth = Omit<Reearth, "plugin" | "ui" | "block" | "layer" | "widget">;

function api({
  render,
  postMessage,
  engine,
  engineAPI,
  pluginId,
  extensionId,
  extensionType,
  pluginProperty,
  events,
  sceneProperty,
  findLayerById,
  findLayerByIds,
  selectedLayer,
  layerSelectionReason,
  layerOverriddenInfobox,
  layers,
  layer,
  block,
  widget,
  camera,
  selectLayer,
  showLayer,
  hideLayer,
  flyTo,
  lookAt,
  zoomIn,
  zoomOut,
}: IFrameAPI &
  Parameters<typeof commonReearth>[0] & {
    engineAPI: any;
    pluginId: string;
    extensionId: string;
    extensionType: string;
    pluginProperty: any;
    layer: () => GlobalThis["reearth"]["layer"];
    block: () => GlobalThis["reearth"]["block"];
    widget: () => GlobalThis["reearth"]["widget"];
  }): GlobalThis {
  return {
    ...builtin(),
    ...(engineAPI ?? {}),
    reearth: {
      ...(engineAPI?.reearth ?? {}),
      ...commonReearth({
        engine,
        sceneProperty,
        events,
        findLayerById,
        findLayerByIds,
        selectedLayer,
        layerSelectionReason,
        layerOverriddenInfobox,
        layers,
        camera,
        selectLayer,
        showLayer,
        hideLayer,
        flyTo,
        lookAt,
        zoomIn,
        zoomOut,
      }),
      ui: {
        show: (
          html: string,
          options?:
            | {
                visible?: boolean | undefined;
              }
            | undefined,
        ) => {
          render(html, options);
        },
        postMessage,
      },
      plugin: {
        get id() {
          return pluginId;
        },
        get extensionType() {
          return extensionType;
        },
        get extensionId() {
          return extensionId;
        },
        get property() {
          return pluginProperty;
        },
      },
      ...(extensionType === "primitive"
        ? {
            get layer() {
              return layer();
            },
          }
        : {}),
      ...(extensionType === "block"
        ? {
            get block() {
              return block();
            },
          }
        : {}),
      ...(extensionType === "widget"
        ? {
            get widget() {
              return widget();
            },
          }
        : {}),
    },
  };
}

const builtin = (): Omit<GlobalThis, "reearth"> => ({
  console: {
    error: console.error,
    log: console.log,
  },
});

export function commonReearth({
  engine,
  events,
  sceneProperty,
  camera,
  selectedLayer,
  layerSelectionReason,
  layerOverriddenInfobox,
  layers,
  findLayerById,
  findLayerByIds,
  selectLayer,
  showLayer,
  hideLayer,
  flyTo,
  lookAt,
  zoomIn,
  zoomOut,
}: {
  engine: string;
  events: Events<ReearthEventType>;
  sceneProperty: () => any;
  camera: () => GlobalThis["reearth"]["visualizer"]["camera"];
  selectedLayer: () => GlobalThis["reearth"]["layers"]["selected"];
  layerSelectionReason: () => GlobalThis["reearth"]["layers"]["selectionReason"];
  layerOverriddenInfobox: () => GlobalThis["reearth"]["layers"]["overriddenInfobox"];
  layers: () => GlobalThis["reearth"]["layers"]["layers"];
  findLayerById: GlobalThis["reearth"]["layers"]["findById"];
  findLayerByIds: GlobalThis["reearth"]["layers"]["findByIds"];
  selectLayer: GlobalThis["reearth"]["layers"]["select"];
  showLayer: GlobalThis["reearth"]["layers"]["show"];
  hideLayer: GlobalThis["reearth"]["layers"]["hide"];
  flyTo: GlobalThis["reearth"]["visualizer"]["flyTo"];
  lookAt: GlobalThis["reearth"]["visualizer"]["lookAt"];
  zoomIn: GlobalThis["reearth"]["visualizer"]["zoomIn"];
  zoomOut: GlobalThis["reearth"]["visualizer"]["zoomOut"];
}): CommonReearth {
  return {
    version: window.REEARTH_CONFIG?.version || "",
    apiVersion: 1,
    visualizer: {
      engine,
      flyTo,
      lookAt,
      zoomIn,
      zoomOut,
      get camera() {
        return camera();
      },
      get property() {
        return sceneProperty();
      },
    },
    layers: {
      select: selectLayer,
      show: showLayer,
      hide: hideLayer,
      get layers() {
        return layers();
      },
      get selectionReason() {
        return layerSelectionReason();
      },
      get overriddenInfobox() {
        return layerOverriddenInfobox();
      },
      get selected() {
        return selectedLayer();
      },
      findById: findLayerById,
      findByIds: findLayerByIds,
    },
    ...events,
  };
}

export function useAPI({
  ctx,
  pluginId = "",
  extensionId = "",
  extensionType = "",
  layer,
  block,
  widget,
  pluginProperty,
  sceneProperty,
}: {
  ctx: VisualizerContext | undefined;
  pluginId: string | undefined;
  extensionId: string | undefined;
  extensionType: string | undefined;
  layer: Layer | undefined;
  block: Block | undefined;
  widget: Widget | undefined;
  pluginProperty: any;
  sceneProperty: any;
}): [((api: IFrameAPI) => GlobalThis) | undefined, EventEmitter<ReearthEventType> | undefined] {
  const engine = ctx?.engine;

  const getLayer = useGet(layer);
  const getBlock = useGet(block);
  const getWidget = useGet(widget);
  const getCamera = useGet(ctx?.camera);
  const getSelectedLayer = useGet(ctx?.selectedLayer);
  const getLayerSelectionReason = useGet(ctx?.layerSelectionReason);
  const getLayerOverriddenInfobox = useGet(ctx?.layerOverridenInfobox);
  const getLayers = useGet(ctx?.layers ?? []);

  const [exposed, emit] = useMemo((): [
    ((api: IFrameAPI) => GlobalThis) | undefined,
    EventEmitter | undefined,
  ] => {
    if (!engine) return [undefined, undefined];
    const [ev, emit] = events<ReearthEventType>();
    const exposed = engine
      ? ({ postMessage, render }: IFrameAPI) =>
          api({
            engine: engine.name,
            engineAPI: ctx.engine?.pluginApi,
            pluginId,
            extensionId,
            extensionType,
            pluginProperty,
            sceneProperty,
            events: ev,
            layers: getLayers,
            selectedLayer: getSelectedLayer,
            layerSelectionReason: getLayerSelectionReason,
            layerOverriddenInfobox: getLayerOverriddenInfobox,
            block: getBlock,
            layer: getLayer,
            widget: getWidget,
            camera: getCamera,
            findLayerById: ctx.findLayerById,
            findLayerByIds: ctx.findLayerByIds,
            selectLayer: ctx.selectLayer,
            showLayer: ctx.showLayer,
            hideLayer: ctx.hideLayer,
            flyTo: engine.flyTo,
            lookAt: engine.lookAt,
            zoomIn: engine.zoomIn,
            zoomOut: engine.zoomOut,
            postMessage,
            render,
          })
      : undefined;
    return [exposed, emit];
  }, [
    ctx?.engine?.pluginApi,
    ctx?.findLayerById,
    ctx?.findLayerByIds,
    ctx?.hideLayer,
    ctx?.selectLayer,
    ctx?.showLayer,
    engine,
    extensionId,
    extensionType,
    getBlock,
    getCamera,
    getLayer,
    getLayerOverriddenInfobox,
    getLayerSelectionReason,
    getLayers,
    getSelectedLayer,
    getWidget,
    pluginId,
    pluginProperty,
    sceneProperty,
  ]);

  useEmit<Pick<ReearthEventType, "cameramove" | "select">>(
    {
      select: ctx?.selectedLayer ? [ctx.selectedLayer] : undefined,
      cameramove: ctx?.camera ? [ctx.camera] : undefined,
    },
    emit,
  );

  useEffect(() => {
    emit?.("update");
  }, [block, emit, layer, widget]);

  useEffect(
    () => () => {
      emit?.("close");
    },
    [emit],
  );

  return [exposed, emit];
}

export function useCommonReearth({
  ctx,
  sceneProperty,
}: {
  ctx: VisualizerContext | undefined;
  sceneProperty: any;
}): [CommonReearth | undefined, EventEmitter<ReearthEventType> | undefined] {
  const engine = ctx?.engine;

  const getCamera = useGet(ctx?.camera);
  const getSelectedLayer = useGet(ctx?.selectedLayer);
  const getLayerSelectionReason = useGet(ctx?.layerSelectionReason);
  const getLayerOverriddenInfobox = useGet(ctx?.layerOverridenInfobox);
  const getLayers = useGet(ctx?.layers ?? []);

  const [ev, emit] = useMemo(
    () => events<Pick<ReearthEventType, "cameramove" | "select">>(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [engine],
  );

  const exposed = useMemo((): CommonReearth | undefined => {
    if (!engine) return;
    return commonReearth({
      engine: engine.name,
      sceneProperty,
      events: ev,
      layers: getLayers,
      selectedLayer: getSelectedLayer,
      layerSelectionReason: getLayerSelectionReason,
      layerOverriddenInfobox: getLayerOverriddenInfobox,
      camera: getCamera,
      findLayerById: ctx.findLayerById,
      findLayerByIds: ctx.findLayerByIds,
      selectLayer: ctx.selectLayer,
      showLayer: ctx.showLayer,
      hideLayer: ctx.hideLayer,
      flyTo: engine.flyTo,
      lookAt: engine.lookAt,
      zoomIn: engine.zoomIn,
      zoomOut: engine.zoomOut,
    });
  }, [
    ctx?.findLayerById,
    ctx?.findLayerByIds,
    ctx?.hideLayer,
    ctx?.selectLayer,
    ctx?.showLayer,
    engine,
    ev,
    getCamera,
    getLayerOverriddenInfobox,
    getLayerSelectionReason,
    getLayers,
    getSelectedLayer,
    sceneProperty,
  ]);

  useEmit<Pick<ReearthEventType, "cameramove" | "select">>(
    {
      select: ctx?.selectedLayer ? [ctx.selectedLayer] : undefined,
      cameramove: ctx?.camera ? [ctx.camera] : undefined,
    },
    emit,
  );

  return [exposed, emit];
}

function useGet<T>(value: T): () => T {
  const ref = useRef<T>(value);
  ref.current = value;
  return useCallback(() => ref.current, []);
}

function useEmit<T extends { [K in string]: any[] }>(
  values: { [K in keyof T]?: T[K] | undefined },
  emit: (<K extends keyof T>(key: K, ...args: T[K]) => void) | undefined,
) {
  for (const k of Object.keys(values)) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      const args = values[k];
      if (!args) return;
      emit?.(k, ...args);
    }, [emit, k, values]);
  }
}
