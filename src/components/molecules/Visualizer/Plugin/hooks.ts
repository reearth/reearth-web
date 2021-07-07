import { useCallback, useEffect, useMemo } from "react";
import { clone } from "lodash-es";

import type { GlobalThis, Primitive, Widget, Block } from "@reearth/plugin";
import type { IFrameAPI } from "@reearth/components/atoms/Plugin";
import events from "@reearth/util/event";
import { useVisualizerContext } from "../context";

export default function ({
  pluginId,
  extensionId,
  sourceCode,
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
  sourceCode?: string;
  pluginBaseUrl?: string;
  extensionType?: string;
  primitive?: Primitive;
  widget?: Widget;
  block?: Block;
  property?: any;
  sceneProperty?: any;
}) {
  const ctx = useVisualizerContext();

  const [reearthEvents, emitReearthEvent] = useMemo(() => {
    const [ev, emit] = events();
    return [ev, emit] as const;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pluginId, extensionId, sourceCode, pluginBaseUrl]);

  const handleError = useCallback(
    (err: any) => {
      console.error(`plugin error from ${pluginId}/${extensionId}: `, err);
    },
    [pluginId, extensionId],
  );

  const handleMessage = useCallback(
    (msg: any) => {
      emitReearthEvent("message", msg);
    },
    [emitReearthEvent],
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
          ...(reearthEvents as any),
        },
      };
    },
    [ctx?.pluginAPI, extensionId, extensionType, pluginId, reearthEvents],
  );

  const exposed = useMemo(
    // TODO: object must be cloned to prevent "already registered" error from qes
    () => ({
      "reearth.primitive": clone(primitive),
      "reearth.widget": clone(widget),
      "reearth.block": clone(block),
      "reearth.plugin.property": clone(property),
      "reearth.visualizer.property": clone(sceneProperty),
    }),
    [block, primitive, widget, property, sceneProperty],
  );

  useEffect(() => {
    return () => {
      emitReearthEvent("close");
    };
  }, [emitReearthEvent]);

  useEffect(() => {
    emitReearthEvent("update");
  }, [exposed, emitReearthEvent]);

  useEffect(() => {
    emitReearthEvent("select", ctx?.selectedPrimitiveId);
  }, [ctx?.selectedPrimitiveId, emitReearthEvent]);

  useEffect(() => {
    if (ctx?.camera) {
      emitReearthEvent("cameramove", ctx.camera);
    }
  }, [ctx?.camera, emitReearthEvent]);

  return {
    skip: !ctx,
    src,
    exposed,
    staticExposed,
    handleError,
    handleMessage,
  };
}
