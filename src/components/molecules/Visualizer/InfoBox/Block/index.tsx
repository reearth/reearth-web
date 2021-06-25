import React, { ComponentType, useMemo } from "react";

import { ValueType, ValueTypes } from "@reearth/util/value";
import type { CommonAPI } from "../..";
import builtin from "./builtin";
import Plugin from "../../Plugin";

export type Block<P = any, PP = any> = {
  plugin?: string;
  property?: P;
  pluginProperty?: PP;
};

export type Props<P = any, PP = any, IP = any, SP = any> = {
  api?: CommonAPI;
  isEditable?: boolean;
  isBuilt?: boolean;
  isSelected?: boolean;
  isHovered?: boolean;
  block?: Block<P, PP>;
  sceneProperty?: SP;
  infoboxProperty?: IP;
  pluginBaseUrl?: string;
  onClick?: () => void;
  onChange?: <T extends ValueType>(
    schemaItemId: string,
    fieldId: string,
    value: ValueTypes[T],
    type: T,
  ) => void;
};

export type Component<P = any, PP = any, IP = any, SP = any> = ComponentType<Props<P, PP, IP, SP>>;

const Block: React.FC<Props> = ({ pluginBaseUrl, ...props }) => {
  const Builtin = props.block?.plugin ? builtin[props.block.plugin] : undefined;
  const exposed = useMemo(() => ({ block: props.block }), [props.block]);

  return Builtin ? (
    <Builtin {...props} />
  ) : (
    <Plugin plugin={props.block?.plugin} exposed={exposed} pluginBaseUrl={pluginBaseUrl} visible />
  );
};

export default Block;
