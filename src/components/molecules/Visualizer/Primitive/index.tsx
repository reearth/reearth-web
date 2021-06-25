import React, { ComponentType, useMemo } from "react";

import { useEngineAPI } from "../engineApi";
import Plugin from "../Plugin";
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
  primitive?: Primitive<P, PP>;
  isEditable?: boolean;
  isBuilt?: boolean;
  isSelected?: boolean;
  sceneProperty?: SP;
  selected?: [id: string | undefined, reason?: string | undefined];
  pluginBaseUrl?: string;
};

export type Component<P = any, PP = any, SP = any> = ComponentType<Props<P, PP, SP>>;

export const Primitive: React.FC<Props> = ({ pluginBaseUrl, ...props }) => {
  const engineApi = useEngineAPI();
  const Builtin = props.primitive?.plugin
    ? engineApi?.builtinPrimitives?.[props.primitive.plugin]
    : undefined;
  const exposed = useMemo(() => ({ primitive: props.primitive }), [props.primitive]);

  return Builtin ? (
    <Builtin {...props} />
  ) : (
    <Plugin
      plugin={props.primitive?.plugin}
      exposed={exposed}
      pluginBaseUrl={pluginBaseUrl}
      visible
    />
  );
};

export default Primitive;
