import type { Events } from "@reearth/util/event";

import type { GlobalThis, Block, Layer, Widget, ReearthEventType, Reearth, Plugin } from "./types";

export type CommonReearth = Omit<Reearth, "plugin" | "ui" | "block" | "layer" | "widget">;

export function exposed({
  render,
  postMessage,
  events,
  engineAPI,
  commonReearth,
  plugin,
  layer,
  block,
  widget,
}: {
  render: (html: string, options?: { visible?: boolean }) => void;
  postMessage: (message: any) => void;
  events: Events<ReearthEventType>;
  engineAPI: any;
  commonReearth: CommonReearth;
  plugin?: Plugin;
  layer?: () => Layer | undefined;
  block?: () => Block | undefined;
  widget?: () => Widget | undefined;
}): GlobalThis {
  return {
    console: {
      error: console.error,
      log: console.log,
    },
    ...(engineAPI ?? {}),
    reearth: {
      ...commonReearth,
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
          return plugin?.id;
        },
        get extensionType() {
          return plugin?.extensionType;
        },
        get extensionId() {
          return plugin?.extensionId;
        },
        get property() {
          return plugin?.property;
        },
      },
      ...(plugin?.extensionType === "primitive"
        ? {
            get layer() {
              return layer?.();
            },
          }
        : {}),
      ...(plugin?.extensionType === "block"
        ? {
            get block() {
              return block?.();
            },
          }
        : {}),
      ...(plugin?.extensionType === "widget"
        ? {
            get widget() {
              return widget?.();
            },
          }
        : {}),
      ...events,
    },
  };
}

export function commonReearth({
  engineName,
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
  engineName: string;
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
      engine: engineName,
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
