import { useCallback, useEffect, useMemo } from "react";

import type { GlobalThis, Primitive, Widget, Block } from "@reearth/plugin";
import type { IFrameAPI } from "@reearth/components/atoms/Plugin";
import events from "@reearth/util/event";
import { useVisualizerContext } from "../context";

export default function ({
  pluginId,
  extensionId,
  pluginBaseUrl,
  extensionType,
  primitive,
  widget,
  block,
  property,
  sceneProperty,
}: {
  pluginId?: string;
  extensionId?: string;
  pluginBaseUrl?: string;
  extensionType?: string;
  primitive?: Primitive;
  widget?: Widget;
  block?: Block;
  property?: any;
  sceneProperty?: any;
}) {
  const ctx = useVisualizerContext();

  const [
    uiEvents,
    emitUiEvent,
    getOnmessage,
    setOnmessage,
    reearthEvents,
    emitReearthEvent,
    getOnUpdate,
    setOnUpdate,
  ] = useMemo(() => {
    const [ev, emit, fn] = events();
    const [get, set] = fn("message");
    const [ev2, emit2, fn2] = events();
    const [getUpdate, setUpdate] = fn2("update");
    return [ev, emit, get, set, ev2, emit2, getUpdate, setUpdate] as const;
  }, []);

  const handleError = useCallback(
    (err: any) => {
      console.error(`plugin error from ${pluginId}/${extensionId}: `, err);
    },
    [pluginId, extensionId],
  );

  const handleMessage = useCallback(
    (msg: any) => {
      emitUiEvent?.("message", msg);
    },
    [emitUiEvent],
  );

  const src =
    pluginId && extensionId
      ? `${pluginBaseUrl}/${`${pluginId}/${extensionId}`.replace(/\.\./g, "")}.js`
      : undefined;

  const staticExposed = useCallback(
    ({ render, postMessage }: IFrameAPI): GlobalThis | undefined => {
      const pluginAPI = ctx?.pluginAPI;
      if (!pluginAPI) return;

      // TODO: quickjs-emscripten throws "Lifetime not alive" error when iFrameApi funcs are wrapped with another function
      const ui = {
        show: render,
        postMessage,
        get onmessage() {
          return getOnmessage();
        },
        set onmessage(value: ((message: any) => void) | undefined) {
          setOnmessage(value);
        },
        ...uiEvents,
      };

      return {
        ...pluginAPI,
        reearth: {
          ...pluginAPI.reearth,
          ui,
          plugin: {
            get id() {
              return pluginId || "";
            },
            get extensionType() {
              return extensionType || "";
            },
            get extensionId() {
              return extensionId || "";
            },
          },
          ...reearthEvents,
          get onupdate() {
            return getOnUpdate();
          },
          set onupdate(value: (() => void) | undefined) {
            setOnUpdate(value);
          },
        },
      };
    },
    [
      ctx?.pluginAPI,
      extensionId,
      extensionType,
      getOnUpdate,
      getOnmessage,
      pluginId,
      reearthEvents,
      setOnUpdate,
      setOnmessage,
      uiEvents,
    ],
  );

  const exposed = useMemo(
    () => ({
      "reearth.primitive": primitive,
      "reearth.widget": widget,
      "reearth.block": block,
      "reearth.plugin.property": property,
      "reearth.visualizer.property": sceneProperty,
    }),
    [block, primitive, widget, property, sceneProperty],
  );

  useEffect(() => {
    emitReearthEvent("update");
  }, [exposed, emitReearthEvent]);

  return {
    skip: !ctx,
    src,
    exposed,
    staticExposed,
    handleError,
    handleMessage,
  };
}
