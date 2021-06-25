import React, { ComponentType, useMemo } from "react";

import Plugin from "../Plugin";
import builtin from "./builtin";
import type { CommonAPI } from "..";

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
  widget?: Widget<P, PP>;
  sceneProperty?: SP;
  pluginBaseUrl?: string;
};

export type Component<P = any, PP = any, SP = any> = ComponentType<Props<P, PP, SP>>;

const Widget: React.FC<Props> = ({ pluginBaseUrl, ...props }) => {
  const Builtin = props.widget?.plugin ? builtin[props.widget.plugin] : undefined;
  const exposed = useMemo(() => ({ widget: props.widget }), [props.widget]);

  return Builtin ? (
    <Builtin {...props} />
  ) : (
    <Plugin plugin={props.widget?.plugin} exposed={exposed} pluginBaseUrl={pluginBaseUrl} visible />
  );
};

export default Widget;
