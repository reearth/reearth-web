import React, { ComponentType, useMemo } from "react";

import { useVisualizerContext } from "../context";
import type { Primitive } from "../Infobox";
// import Plugins, { Widget } from "../Plugin";

export type { Primitive } from "../Infobox";

export type Props<P = any, PP = any, SP = any> = {
  primitive?: Primitive<P>;
  isEditable?: boolean;
  isBuilt?: boolean;
  isSelected?: boolean;
  isHidden?: boolean;
  pluginProperty?: PP;
  sceneProperty?: SP;
  pluginBaseUrl?: string;
};

export type Component<P = any, PP = any, SP = any> = ComponentType<Props<P, PP, SP>>;

export default function PrimitiveComponent<P = any, PP = any, SP = any>({
  isHidden,
  pluginBaseUrl: _pluginBaseUrl,
  ...props
}: Props<P, PP, SP>) {
  const ctx = useVisualizerContext();
  const Builtin = useMemo(() => {
    const builtin = ctx?.engine?.builtinPrimitives;
    return props.primitive?.pluginId && props.primitive.extensionId
      ? builtin?.[`${props.primitive.pluginId}/${props.primitive.extensionId}`]
      : undefined;
  }, [ctx, props.primitive?.extensionId, props.primitive?.pluginId]);

  return isHidden || !props.primitive?.isVisible ? null : Builtin ? <Builtin {...props} /> : null; // TODO: primitive plugin is unsupported yet
  // <Plugin
  //   pluginId={props.primitive?.pluginId}
  //   extensionId={props.primitive?.extensionId}
  //   sourceCode={(props.primitive as any)?.__REEARTH_SOURCECODE} // for debugging
  //   extensionType="primitive"
  //   pluginBaseUrl={pluginBaseUrl}
  //   visible={false}
  //   property={props.pluginProperty}
  //   sceneProperty={props.sceneProperty}
  //   primitive={props.primitive}
  //   pluginProperty={pluginProperty}
  // />
}
