import React, { ComponentType, useMemo } from "react";

import { useVisualizerContext } from "../context";
import Plugin, { Primitive } from "../Plugin";

export type { Primitive } from "../Plugin";

export type Props<PP = any, SP = any> = {
  primitive?: Primitive;
  isEditable?: boolean;
  isBuilt?: boolean;
  isSelected?: boolean;
  pluginProperty?: PP;
  sceneProperty?: SP;
  selected?: [id: string | undefined, reason?: string | undefined];
  pluginBaseUrl?: string;
};

export type Component<PP = any, SP = any> = ComponentType<Props<PP, SP>>;

export default function PrimitiveComponent<PP = any, SP = any>({
  pluginBaseUrl,
  ...props
}: Props<PP, SP>) {
  const ctx = useVisualizerContext();
  const Builtin = useMemo(
    () =>
      props.primitive?.pluginId && props.primitive.extensionId
        ? ctx?.engine()?.builtinPrimitives?.[
            `${props.primitive.pluginId}/${props.primitive.extensionId}`
          ]
        : undefined,
    [ctx, props.primitive?.extensionId, props.primitive?.pluginId],
  );

  return !props.primitive?.isVisible ? null : Builtin ? (
    <Builtin {...props} />
  ) : (
    <Plugin
      pluginId={props.primitive?.pluginId}
      extensionId={props.primitive?.extensionId}
      sourceCode={(props.primitive as any)?.__REEARTH_SOURCECODE} // for debugging
      extensionType="primitive"
      pluginBaseUrl={pluginBaseUrl}
      property={props.pluginProperty}
      sceneProperty={props.sceneProperty}
      visible={false}
      primitive={props.primitive}
    />
  );
}
