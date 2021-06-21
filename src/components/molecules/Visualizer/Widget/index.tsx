import React, { ComponentType } from "react";

import type { CommonAPI } from "..";
import builtin from "./builtin";

export type Widget<P = any, PP = any> = {
  id?: string;
  plugin?: string;
  property?: P;
  pluginProperty?: PP;
  enabled?: boolean;
};

export type Props<P = any, PP = any, SP = any> = {
  api?: CommonAPI;
  isEditable?: boolean;
  isBuilt?: boolean;
  widget: Widget<P, PP>;
  sceneProperty?: SP;
};

export type Component<P = any, PP = any, SP = any> = ComponentType<Props<P, PP, SP>>;

const Widget: React.FC<Props> = props => {
  const Builtin = props.widget.plugin ? builtin[props.widget.plugin] : undefined;

  return Builtin ? <Builtin {...props} /> : null;
};

export default Widget;
