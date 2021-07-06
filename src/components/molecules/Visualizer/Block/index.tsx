import React, { ComponentType } from "react";

import { ValueType, ValueTypes } from "@reearth/util/value";
import builtin from "./builtin";
import Plugin, { Block, Primitive } from "../Plugin";

export type { Primitive, Block } from "../Plugin";

export type Props<PP = any, IP = any, SP = any> = {
  isEditable?: boolean;
  isBuilt?: boolean;
  isSelected?: boolean;
  primitive?: Primitive;
  block?: Block;
  sceneProperty?: SP;
  infoboxProperty?: IP;
  pluginProperty?: PP;
  pluginBaseUrl?: string;
  onClick?: () => void;
  onChange?: <T extends ValueType>(
    schemaItemId: string,
    fieldId: string,
    value: ValueTypes[T],
    type: T,
  ) => void;
};

export type Component<PP = any, IP = any, SP = any> = ComponentType<Props<PP, IP, SP>>;

export default function BlockComponent<PP = any, IP = any, SP = any>({
  pluginBaseUrl,
  ...props
}: Props<PP, IP, SP>): JSX.Element {
  const Builtin =
    props.block?.pluginId && props.block.extensionId
      ? builtin[`${props.block.pluginId}/${props.block.extensionId}`]
      : undefined;

  return Builtin ? (
    <Builtin {...props} />
  ) : (
    <Plugin
      pluginId={props.block?.pluginId}
      extensionId={props.block?.extensionId}
      extensionType="block"
      pluginBaseUrl={pluginBaseUrl}
      property={props.pluginProperty}
      sceneProperty={props.sceneProperty}
      visible
      primitive={props.primitive}
      block={props.block}
    />
  );
}
