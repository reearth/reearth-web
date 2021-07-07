import React, { ComponentType } from "react";

import Plugin, { Widget } from "../Plugin";
import builtin from "./builtin";

export type { Widget } from "../Plugin";

export type Props<PP = any, SP = any> = {
  isEditable?: boolean;
  isBuilt?: boolean;
  widget?: Widget;
  sceneProperty?: SP;
  pluginProperty?: PP;
  pluginBaseUrl?: string;
};

export type Component<PP = any, SP = any> = ComponentType<Props<PP, SP>>;

export default function WidgetComponent<PP = any, SP = any>({
  pluginBaseUrl,
  ...props
}: Props<PP, SP>) {
  const Builtin =
    props.widget?.pluginId && props.widget.extensionId
      ? builtin[`${props.widget.pluginId}/${props.widget.extensionId}`]
      : undefined;

  return Builtin ? (
    <Builtin {...props} />
  ) : (
    <Plugin
      pluginId={props.widget?.pluginId}
      extensionId={props.widget?.extensionId}
      sourceCode={(props.widget as any)?.__REEARTH_SOURCECODE} // for debugging
      extensionType="widget"
      visible
      pluginBaseUrl={pluginBaseUrl}
      property={props.pluginProperty}
      sceneProperty={props.sceneProperty}
      widget={props.widget}
    />
  );
}
