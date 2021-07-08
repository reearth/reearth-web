import { useCallback, useEffect, useMemo } from "react";
import { cloneDeep } from "lodash-es";

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
      "reearth.primitive": cloneDeep(primitive),
      "reearth.widget": cloneDeep(widget),
      "reearth.block": cloneDeep(block),
      "reearth.primitives.primitives": cloneDeep(ctx?.primitives),
      "reearth.primitives.selected": cloneDeep(ctx?.selectedPrimitive),
      "reearth.plugin.property": cloneDeep(property),
      "reearth.visualizer.camera": cloneDeep(ctx?.camera),
      "reearth.visualizer.property": cloneDeep(sceneProperty),
    }),
    [
      ctx?.primitives,
      ctx?.selectedPrimitive,
      ctx?.camera,
      primitive,
      widget,
      block,
      property,
      sceneProperty,
    ],
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
    emitReearthEvent("select", cloneDeep(ctx?.selectedPrimitive));
  }, [ctx?.selectedPrimitive, emitReearthEvent]);

  useEffect(() => {
    if (ctx?.camera) {
      emitReearthEvent("cameramove", cloneDeep(ctx.camera));
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
