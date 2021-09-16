import { useMemo, useCallback, useRef, useEffect } from "react";

import type { IFrameAPI } from "@reearth/components/atoms/Plugin";
import type { GlobalThis, Block, Primitive, Widget, ReearthEventType } from "@reearth/plugin";
import events, { Events } from "@reearth/util/event";
import type { EventEmitter } from "@reearth/util/event";

import type { VisualizerContext } from "..";

function api({
  render,
  postMessage,
  engine,
  engineAPI,
  pluginId,
  extensionId,
  extensionType,
  pluginProperty,
  sceneProperty,
  events,
  selectedPrimitive,
  primitiveSelectionReason,
  primitiveOverriddenInfobox,
  primitives,
  primitive,
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
}: IFrameAPI & {
  engine: string;
  engineAPI: any;
  pluginId: string;
  extensionId: string;
  extensionType: string;
  pluginProperty: any;
  sceneProperty: any;
  events: Events<ReearthEventType>;
  selectedPrimitive: () => GlobalThis["reearth"]["primitives"]["selected"];
  primitiveSelectionReason: () => GlobalThis["reearth"]["primitives"]["selectionReason"];
  primitiveOverriddenInfobox: () => GlobalThis["reearth"]["primitives"]["overriddenInfobox"];
  primitives: () => GlobalThis["reearth"]["primitives"]["primitives"];
  primitive: () => GlobalThis["reearth"]["primitive"];
  block: () => GlobalThis["reearth"]["block"];
  widget: () => GlobalThis["reearth"]["widget"];
  camera: () => GlobalThis["reearth"]["visualizer"]["camera"];
  selectLayer: GlobalThis["reearth"]["primitives"]["select"];
  showLayer: GlobalThis["reearth"]["primitives"]["show"];
  hideLayer: GlobalThis["reearth"]["primitives"]["hide"];
  flyTo: GlobalThis["reearth"]["visualizer"]["flyTo"];
  lookAt: GlobalThis["reearth"]["visualizer"]["lookAt"];
  zoomIn: GlobalThis["reearth"]["visualizer"]["zoomIn"];
  zoomOut: GlobalThis["reearth"]["visualizer"]["zoomOut"];
}): GlobalThis {
  return {
    ...builtin(),
    ...(engineAPI ?? {}),
    reearth: {
      ...(engineAPI?.reearth ?? {}),
      version: window.REEARTH_CONFIG?.version || "",
      apiVersion: 1,
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
          return sceneProperty;
        },
      },
      primitives: {
        select: selectLayer,
        show: showLayer,
        hide: hideLayer,
        get primitives() {
          return primitives();
        },
        get selectionReason() {
          return primitiveSelectionReason();
        },
        get overriddenInfobox() {
          return primitiveOverriddenInfobox();
        },
        get selected() {
          return selectedPrimitive();
        },
      },
      ...(extensionType === "primitive"
        ? {
            get primitive() {
              return primitive();
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
      ...events,
    },
  };
}

const builtin = (): Omit<GlobalThis, "reearth"> => ({
  console: {
    error: console.error,
    log: console.log,
  },
});

export function useAPI({
  ctx,
  pluginId = "",
  extensionId = "",
  extensionType = "",
  primitive,
  block,
  widget,
  pluginProperty,
  sceneProperty,
}: {
  ctx: VisualizerContext | undefined;
  pluginId: string | undefined;
  extensionId: string | undefined;
  extensionType: string | undefined;
  primitive: Primitive | undefined;
  block: Block | undefined;
  widget: Widget | undefined;
  pluginProperty: any;
  sceneProperty: any;
}): [((api: IFrameAPI) => GlobalThis) | undefined, EventEmitter<ReearthEventType> | undefined] {
  const engine = ctx?.engine;

  const getPrimitive = useGet(primitive);
  const getBlock = useGet(block);
  const getWidget = useGet(widget);
  const getCamera = useGet(ctx?.camera);
  const getSelectedPrimitive = useGet(ctx?.selectedPrimitive);
  const getPrimitiveSelectionReason = useGet(ctx?.primitiveSelectionReason);
  const getPrimitiveOverriddenInfobox = useGet(ctx?.primitiveOverridenInfobox);
  const getPrimitives = useGet(ctx?.primitives ?? []);

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
            primitives: getPrimitives,
            selectedPrimitive: getSelectedPrimitive,
            primitiveSelectionReason: getPrimitiveSelectionReason,
            primitiveOverriddenInfobox: getPrimitiveOverriddenInfobox,
            block: getBlock,
            primitive: getPrimitive,
            widget: getWidget,
            camera: getCamera,
            selectLayer: ctx.selectPrimitive,
            showLayer: ctx.showPrimitive,
            hideLayer: ctx.hidePrimitive,
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
    ctx?.hidePrimitive,
    ctx?.selectPrimitive,
    ctx?.showPrimitive,
    engine,
    extensionId,
    extensionType,
    getBlock,
    getCamera,
    getPrimitive,
    getWidget,
    pluginId,
    pluginProperty,
    sceneProperty,
  ]);

  useEmit<Pick<ReearthEventType, "cameramove" | "select">>(
    {
      select: ctx?.selectedPrimitive ? [ctx.selectedPrimitive] : undefined,
      cameramove: ctx?.camera ? [ctx.camera] : undefined,
    },
    emit,
  );

  useEffect(() => {
    emit?.("update");
  }, [block, emit, primitive, widget]);

  useEffect(
    () => () => {
      emit?.("close");
    },
    [emit],
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
