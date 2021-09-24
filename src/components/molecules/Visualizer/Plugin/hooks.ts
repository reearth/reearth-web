import { Options } from "quickjs-emscripten-sync";
import { useCallback, useEffect, useMemo } from "react";

import { IFrameAPI } from "@reearth/components/atoms/Plugin/hooks";
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
  property?: any;
  pluginProperty?: any;
}) {
  const { staticExposed, emit, isMarshalable } =
    useAPI({
      extensionId,
      extensionType,
      pluginId,
      block,
      layer,
      widget,
      pluginProperty,
    }) ?? [];

  const handleError = useCallback(
    (err: any) => {
      console.error(`plugin error from ${pluginId}/${extensionId}: `, err);
    },
    [pluginId, extensionId],
  );

  const handleMessage = useCallback(
    (msg: any) => {
      emit?.("message", msg);
    },
    [emit],
  );

  const src =
    pluginId && extensionId
      ? `${pluginBaseUrl}/${`${pluginId}/${extensionId}`.replace(/\.\./g, "")}.js`
      : undefined;

  return {
    skip: !staticExposed,
    src,
    isMarshalable,
    staticExposed,
    handleError,
    handleMessage,
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
  emit: EventEmitter<ReearthEventType> | undefined;
  isMarshalable: Options["isMarshalable"] | undefined;
} {
  const ctx = useContext();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const [ev, emit] = useMemo(() => events<ReearthEventType>(), [extensionId, pluginId]);

  const getLayer = useGet(layer);
  const getBlock = useGet(block);
  const getWidget = useGet(widget);

  const staticExposed = useMemo((): ((api: IFrameAPI) => GlobalThis) | undefined => {
    if (!ctx) return;
    return ({ postMessage, render }: IFrameAPI) =>
      exposed({
        engineAPI: ctx.engine.api,
        commonReearth: ctx.reearth,
        events: ev,
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
  }, [
    ctx,
    ev,
    extensionId,
    extensionType,
    getBlock,
    getLayer,
    getWidget,
    pluginId,
    pluginProperty,
  ]);

  // merge events
  useEffect(() => {
    if (!ctx) return;
    const source: Events<ReearthEventType> = {
      on: ctx.reearth.on,
      off: ctx.reearth.off,
      once: ctx.reearth.once,
    };
    return mergeEvents(source, emit, ["cameramove", "select"]);
  }, [ctx, emit]);

  useEffect(() => {
    emit?.("update");
  }, [block, emit, layer, widget]);

  useEffect(
    () => () => {
      emit?.("close");
    },
    [emit],
  );

  return {
    staticExposed,
    emit,
    isMarshalable: ctx?.engine.isMarshalable,
  };
}
