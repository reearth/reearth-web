import React, { ComponentType } from "react";
import useHooks from "./hooks";

import type { CommonAPI } from "..";

export type Primitive<P = any, PP = any> = {
  id: string;
  plugin?: string;
  property?: P;
  pluginProperty?: PP;
  isVisible?: boolean;
};

export type Props<P = any, PP = any, SP = any> = {
  api?: CommonAPI;
  primitive: Primitive<P, PP>;
  isEditable?: boolean;
  isBuilt?: boolean;
  isSelected?: boolean;
  sceneProperty?: SP;
  selected?: [id: string | undefined, reason?: string | undefined];
};

export type Component<P = any, PP = any, SP = any> = ComponentType<Props<P, PP, SP>>;

export const Primitive: React.FC<Props> = props => {
  const { Builtin } = useHooks({ plugin: props.primitive.plugin });

  return Builtin ? <Builtin {...props} /> : null;
};

export default Primitive;
