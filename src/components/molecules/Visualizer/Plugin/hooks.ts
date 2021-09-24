import { useCallback } from "react";

import { useAPI } from "./api";
import { useVisualizerContext } from "./context";
import type { Layer, Widget, Block } from "./types";

export default function ({
  pluginId,
  extensionId,
  pluginBaseUrl,
  extensionType,
  block,
  layer,
  widget,
  sceneProperty,
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
      layer,
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
