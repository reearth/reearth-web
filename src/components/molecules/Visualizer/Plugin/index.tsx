import React, { CSSProperties, useCallback, useMemo } from "react";

import { GlobalThis, Primitive, Widget, Block } from "@reearth/plugin";
import events from "@reearth/util/event";
import P, { IFrameAPI } from "@reearth/components/atoms/Plugin";
import { useVisualizerContext } from "../context";

export type { Primitive, Block, Widget } from "@reearth/plugin";

export type Props = {
  className?: string;
  style?: CSSProperties;
  pluginId?: string;
  extensionId?: string;
  extensionType?: string;
  visible?: boolean;
  property?: any;
  sceneProperty?: any;
  pluginBaseUrl?: string;
  primitive?: Primitive;
  widget?: Widget;
  block?: Block;
};

const defaultPluginBaseUrl = `${window.REEARTH_CONFIG?.api || "/api"}/plugins`;

export default function Plugin({
  className,
  style,
  pluginId,
  extensionId,
  extensionType,
  property,
  visible,
  pluginBaseUrl = defaultPluginBaseUrl,
  primitive,
  widget,
  block,
  sceneProperty,
}: Props): JSX.Element | null {
  const ctx = useVisualizerContext();

  const [messageEvents, onMessage, getOnmessage, setOnmessage] = useMemo(() => {
    const [ev, emit, fn] = events();
    const [get, set] = fn("message");
    return [ev, emit, get, set] as const;
  }, []);

  const handleError = useCallback(
    (err: any) => {
      console.error(`plugin error from ${pluginId}/${extensionId}: `, err);
    },
    [pluginId, extensionId],
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
        on: messageEvents.on,
        off: messageEvents.off,
        once: messageEvents.once,
        get onmessage() {
          return getOnmessage();
        },
        set onmessage(value: ((message: any) => void) | undefined) {
          setOnmessage(value);
        },
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
        },
      };
    },
    [
      ctx?.pluginAPI,
      extensionId,
      extensionType,
      getOnmessage,
      messageEvents.off,
      messageEvents.on,
      messageEvents.once,
      pluginId,
      setOnmessage,
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

  return src ? (
    <P
      skip={!ctx}
      className={className}
      style={style}
      src={src}
      staticExposed={staticExposed}
      exposed={exposed}
      onError={handleError}
      onMessage={onMessage}
      canBeVisible={visible}
    />
  ) : null;
}
