import { Options } from "quickjs-emscripten-sync";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { API as IFrameAPI } from "@reearth/components/atoms/Plugin";
import { defaultIsMarshalable } from "@reearth/components/atoms/Plugin";
import events, { EventEmitter, Events, mergeEvents } from "@reearth/util/event";

import { useGet } from "../utils";

import { exposed } from "./api";
import { useContext } from "./context";
import type { PluginModalInfo } from "./ModalContainer";
import type { Layer, Widget, Block, GlobalThis, ReearthEventType } from "./types";

export default function ({
  pluginId,
  extensionId,
  pluginBaseUrl,
  extensionType,
  block,
  layer,
  widget,
  pluginProperty,
  shownPluginModalInfo,
  showPluginModal,
  onRender,
  onResize,
}: {
  pluginId?: string;
  extensionId?: string;
  pluginBaseUrl?: string;
  extensionType?: string;
  layer?: Layer;
  widget?: Widget;
  block?: Block;
  pluginProperty?: any;
  shownPluginModalInfo?: PluginModalInfo;
  showPluginModal?: (modalInfo?: PluginModalInfo) => void;
  onRender?: (
    options:
      | {
          width?: string | number;
          height?: string | number;
          extended?: boolean;
        }
      | undefined,
  ) => void;
  onResize?: (
    width: string | number | undefined,
    height: string | number | undefined,
    extended: boolean | undefined,
  ) => void;
}) {
  const [modalCanBeVisible, setModalCanBeVisible] = useState<boolean>(false);

  useEffect(() => {
    const visible =
      shownPluginModalInfo?.id === `${pluginId ?? ""}/${extensionId ?? ""}/${widget?.id ?? ""}`;
    if (visible !== modalCanBeVisible) {
      setModalCanBeVisible(visible);
    }
  }, [modalCanBeVisible, shownPluginModalInfo, pluginId, extensionId, widget?.id]);

  const { staticExposed, isMarshalable, onPreInit, onDispose } =
    useAPI({
      extensionId,
      extensionType,
      pluginId,
      block,
      layer,
      widget,
      pluginProperty,
      modalCanBeVisible,
      showPluginModal,
      onRender,
      onResize,
    }) ?? [];

  const onError = useCallback(
    (err: any) => {
      console.error(`plugin error from ${pluginId}/${extensionId}: `, err);
    },
    [pluginId, extensionId],
  );

  const src =
    pluginId && extensionId
      ? `${pluginBaseUrl}/${`${pluginId}/${extensionId}`.replace(/\.\./g, "")}.js`
      : undefined;

  return {
    skip: !staticExposed,
    src,
    isMarshalable,
    modalCanBeVisible,
    exposed: staticExposed,
    onError,
    onPreInit,
    onDispose,
  };
}

export function useAPI({
  pluginId = "",
  extensionId = "",
  extensionType = "",
  pluginProperty,
  layer,
  block,
  widget,
  modalCanBeVisible,
  showPluginModal,
  onRender,
  onResize,
}: {
  pluginId: string | undefined;
  extensionId: string | undefined;
  extensionType: string | undefined;
  pluginProperty: any;
  layer: Layer | undefined;
  block: Block | undefined;
  widget: Widget | undefined;
  modalCanBeVisible?: boolean;
  showPluginModal?: (modalInfo?: PluginModalInfo) => void;
  onRender?: (
    options:
      | {
          width?: string | number;
          height?: string | number;
          extended?: boolean;
        }
      | undefined,
  ) => void;
  onResize?: (
    width: string | number | undefined,
    height: string | number | undefined,
    extended: boolean | undefined,
  ) => void;
}): {
  staticExposed: ((api: IFrameAPI) => GlobalThis) | undefined;
  isMarshalable: Options["isMarshalable"] | undefined;
  onPreInit: () => void;
  onDispose: () => void;
} {
  const ctx = useContext();
  const getLayer = useGet(layer);
  const getBlock = useGet(block);
  const getWidget = useGet(widget);

  const event =
    useRef<[Events<ReearthEventType>, EventEmitter<ReearthEventType>, (() => void) | undefined]>();

  const onPreInit = useCallback(() => {
    const e = events<ReearthEventType>();
    let cancel: (() => void) | undefined;

    if (ctx?.reearth.on && ctx.reearth.off && ctx.reearth.once) {
      const source: Events<ReearthEventType> = {
        on: ctx.reearth.on,
        off: ctx.reearth.off,
        once: ctx.reearth.once,
      };
      cancel = mergeEvents(source, e[1], [
        "cameramove",
        "select",
        "click",
        "doubleclick",
        "mousedown",
        "mouseup",
        "rightclick",
        "rightdown",
        "rightup",
        "middleclick",
        "middledown",
        "middleup",
        "mousemove",
        "mouseenter",
        "mouseleave",
        "wheel",
        "tick",
      ]);
    }

    event.current = [e[0], e[1], cancel];
  }, [ctx?.reearth.on, ctx?.reearth.off, ctx?.reearth.once]);

  const onDispose = useCallback(() => {
    event.current?.[1]("close");
    event.current?.[2]?.();
    event.current = undefined;
    if (modalCanBeVisible) {
      showPluginModal?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isMarshalable = useCallback(
    (target: any) => defaultIsMarshalable(target) || !!ctx?.reearth.layers.isLayer(target),
    [ctx?.reearth.layers],
  );

  const staticExposed = useMemo((): ((api: IFrameAPI) => GlobalThis) | undefined => {
    if (!ctx?.reearth) return;
    return ({ main, modal, messages }: IFrameAPI) => {
      return exposed({
        commonReearth: ctx.reearth,
        events: {
          on: (type, e) => {
            if (type === "message") {
              messages.on(e as (msg: any) => void);
              return;
            }
            event.current?.[0]?.on(type, e);
          },
          off: (type, e) => {
            if (type === "message") {
              messages.off(e as (msg: any) => void);
              return;
            }
            event.current?.[0]?.on(type, e);
          },
          once: (type, e) => {
            if (type === "message") {
              messages.once(e as (msg: any) => void);
              return;
            }
            event.current?.[0]?.on(type, e);
          },
        },
        plugin: {
          id: pluginId,
          extensionType,
          extensionId,
          property: pluginProperty,
        },
        block: getBlock,
        layer: getLayer,
        widget: getWidget,
        postMessage: main.postMessage,
        render: (html, { extended, ...options } = {}) => {
          main.render(html, options);
          onRender?.(
            typeof extended !== "undefined" || options ? { extended, ...options } : undefined,
          );
        },
        renderModal: (html, { ...options } = {}) => {
          modal.render(html, options);
          showPluginModal?.({
            id: `${pluginId ?? ""}/${extensionId ?? ""}/${widget?.id ?? ""}`,
            background: options?.background,
          });
        },
        closeModal: () => {
          showPluginModal?.();
        },
        updateModal: (options: {
          width?: string | number;
          height?: string | number;
          background?: string;
        }) => {
          modal.resize(options.width, options.height);
          showPluginModal?.({
            id: `${pluginId ?? ""}/${extensionId ?? ""}/${widget?.id ?? ""}`,
            background: options.background,
          });
        },
        postMessageModal: modal.postMessage,
        resize: (width, height, extended) => {
          main.resize(width, height);
          onResize?.(width, height, extended);
        },
        overrideSceneProperty: ctx.overrideSceneProperty,
      });
    };
  }, [
    ctx?.reearth,
    ctx?.overrideSceneProperty,
    extensionId,
    extensionType,
    pluginId,
    pluginProperty,
    widget?.id,
    getBlock,
    getLayer,
    getWidget,
    showPluginModal,
    onRender,
    onResize,
  ]);

  useEffect(() => {
    event.current?.[1]("update");
  }, [block, layer, widget, ctx?.reearth.scene.property]);

  return {
    staticExposed,
    isMarshalable,
    onPreInit,
    onDispose,
  };
}
