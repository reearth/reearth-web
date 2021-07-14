import React, { ComponentType, useMemo } from "react";

import { useVisualizerContext } from "../context";
import Plugin, { Primitive } from "../Plugin";

export type { Primitive } from "../Plugin";

export type Props<PP = any, SP = any> = {
  primitive?: Primitive;
  isEditable?: boolean;
  isBuilt?: boolean;
  isSelected?: boolean;
  isHidden?: boolean;
  pluginProperty?: PP;
  sceneProperty?: SP;
  pluginBaseUrl?: string;
};

export type Component<PP = any, SP = any> = ComponentType<Props<PP, SP>>;

export default function PrimitiveComponent<PP = any, SP = any>({
  pluginBaseUrl,
  isHidden,
  ...props
}: Props<PP, SP>) {
  const ctx = useVisualizerContext();
  const Builtin = useMemo(() => {
    const builtin = ctx?.engine?.builtinPrimitives;
    return props.primitive?.pluginId && props.primitive.extensionId
      ? builtin?.[`${props.primitive.pluginId}/${props.primitive.extensionId}`]
      : undefined;
  }, [ctx, props.primitive?.extensionId, props.primitive?.pluginId]);

  return isHidden || !props.primitive?.isVisible ? null : Builtin ? (
    <Builtin {...props} />
  ) : (
    <Plugin
      pluginId={props.primitive?.pluginId}
      extensionId={props.primitive?.extensionId}
      sourceCode={(props.primitive as any)?.__REEARTH_SOURCECODE} // for debugging
      extensionType="primitive"
      pluginBaseUrl={pluginBaseUrl}
      visible={false}
      property={props.pluginProperty}
      sceneProperty={props.sceneProperty}
      primitive={props.primitive}
    />
  );
}
