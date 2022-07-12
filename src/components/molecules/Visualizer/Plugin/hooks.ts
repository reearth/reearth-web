import { Options } from "quickjs-emscripten-sync";
import { useCallback, useEffect, useMemo, useRef } from "react";

import type { IFrameAPI } from "@reearth/components/atoms/Plugin";
import { defaultIsMarshalable } from "@reearth/components/atoms/Plugin";
import events, { EventEmitter, Events, mergeEvents } from "@reearth/util/event";

import { useGet } from "../utils";

import { exposed } from "./api";
import { useContext } from "./context";
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
  const { staticExposed, isMarshalable, onPreInit, onDispose, onMessage } =
    useAPI({
      extensionId,
      extensionType,
      pluginId,
      block,
      layer,
      widget,
      pluginProperty,
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
    exposed: staticExposed,
    onError,
    onMessage,
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
  onMessage: (message: any) => void;
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
      cancel = mergeEvents(source, e[1], ["cameramove", "select"]);
    }

    event.current = [e[0], e[1], cancel];
  }, [ctx?.reearth.on, ctx?.reearth.off, ctx?.reearth.once]);

  const onDispose = useCallback(() => {
    event.current?.[1]("close");
    event.current?.[2]?.();
    event.current = undefined;
  }, []);

  const onMessage = useCallback((msg: any) => {
    event.current?.[1]("message", msg);
  }, []);

  const isMarshalable = useCallback(
    (target: any) => {
      if (defaultIsMarshalable(target)) return true;
      if (ctx?.reearth.layers.isLayer(target)) return true;
      if (typeof ctx?.engine.isMarshalable === "function") {
        return ctx.engine.isMarshalable(target);
      }
      return ctx?.engine.isMarshalable || false;
    },
    [ctx?.engine, ctx?.reearth.layers],
  );

  const staticExposed = useMemo((): ((api: IFrameAPI) => GlobalThis) | undefined => {
    if (!ctx?.reearth) return;
    return ({ postMessage, render, resize }: IFrameAPI) => {
      return exposed({
        commonReearth: ctx.reearth,
        events: event.current?.[0] ?? { on: () => {}, off: () => {}, once: () => {} },
        plugin: {
          id: pluginId,
          extensionType,
          extensionId,
          property: pluginProperty,
        },
        block: getBlock,
        layer: getLayer,
        widget: getWidget,
        postMessage,
        render: (html, { extended, ...options } = {}) => {
          render(html, options);
          onRender?.(
            typeof extended !== "undefined" || options ? { extended, ...options } : undefined,
          );
        },
        resize: (width, height, extended) => {
          resize(width, height);
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
    getBlock,
    getLayer,
    getWidget,
    onRender,
    onResize,
  ]);

  useEffect(() => {
    event.current?.[1]("update");
  }, [block, layer, widget, ctx?.reearth.visualizer.property]);

  return {
    staticExposed,
    isMarshalable,
    onMessage,
    onPreInit,
    onDispose,
  };
}
