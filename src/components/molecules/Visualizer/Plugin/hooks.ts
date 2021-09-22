import { useCallback } from "react";

import { useVisualizerContext } from "../context";

import { useAPI } from "./api";
import type { Primitive, Widget, Block } from "./types";

export default function ({
  pluginId,
  extensionId,
  pluginBaseUrl,
  extensionType,
  block,
  primitive,
  widget,
  sceneProperty,
  pluginProperty,
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
  pluginProperty?: any;
}) {
  const ctx = useVisualizerContext();
  const [staticExposed, emit] =
    useAPI({
      ctx,
      extensionId,
      extensionType,
      pluginId,
      block,
      primitive,
      widget,
      sceneProperty,
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
    isMarshalable: ctx?.engine?.isMarshalable,
    staticExposed,
    handleError,
    handleMessage,
  };
}
