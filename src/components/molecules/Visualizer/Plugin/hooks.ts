import { Options } from "quickjs-emscripten-sync";
import { useCallback, useEffect, useMemo, useRef } from "react";

import type { IFrameAPI } from "@reearth/components/atoms/Plugin";
import { defaultIsMarshalable } from "@reearth/components/atoms/Plugin";
import events, { EventEmitter, Events, mergeEvents } from "@reearth/util/event";

import { exposed } from "./api";
import { useGet, useContext } from "./context";
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
}: {
  pluginId?: string;
  extensionId?: string;
  pluginBaseUrl?: string;
  extensionType?: string;
  layer?: Layer;
  widget?: Widget;
  block?: Block;
  pluginProperty?: any;
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

  const autoResize = useMemo((): "both" | "width-only" | "height-only" | undefined => {
    const { horizontally, vertically } = widget?.extended ?? {};
    if (horizontally && vertically) return "both";
    if (vertically) return "width-only";
    if (horizontally) return "height-only";
    return undefined;
  }, [widget?.extended]);

  return {
    skip: !staticExposed,
    src,
    isMarshalable,
    exposed: staticExposed,
    onError,
    onMessage,
    onPreInit,
    onDispose,
    autoResize,
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
}: {
  pluginId: string | undefined;
  extensionId: string | undefined;
  extensionType: string | undefined;
  pluginProperty: any;
  layer: Layer | undefined;
  block: Block | undefined;
  widget: Widget | undefined;
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
    return ({ postMessage, render }: IFrameAPI) => {
      return exposed({
        engineAPI: ctx.engine.api,
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
        render,
      });
    };
  }, [
    ctx?.engine.api,
    ctx?.reearth,
    extensionId,
    extensionType,
    pluginId,
    pluginProperty,
    getBlock,
    getLayer,
    getWidget,
  ]);

  useEffect(() => {
    event.current?.[1]("update");
  }, [block, layer, widget]);

  return {
    staticExposed,
    isMarshalable,
    onMessage,
    onPreInit,
    onDispose,
  };
}
