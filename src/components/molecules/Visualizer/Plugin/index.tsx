import React, { CSSProperties } from "react";

export type { Primitive, Block, Widget } from "@reearth/plugin";
import { Primitive, Widget, Block } from "@reearth/plugin";
import P from "@reearth/components/atoms/Plugin";

import useHooks from "./hooks";

export type Props = {
  className?: string;
  style?: CSSProperties;
  sourceCode?: string;
  pluginId?: string;
  extensionId?: string;
  extensionType?: string;
  visible?: boolean;
  property?: any;
  sceneProperty?: any;
  pluginBaseUrl?: string;
  primitive?: Primitive;
  widget?: Widget;
  block?: Block;
};

export default function Plugin({
  className,
  style,
  sourceCode,
  pluginId,
  extensionId,
  extensionType,
  property,
  visible,
  pluginBaseUrl = "/plugins",
  primitive,
  widget,
  block,
  sceneProperty,
}: Props): JSX.Element | null {
  const { skip, src, exposed, isMarshalable, staticExposed, handleError, handleMessage } = useHooks(
    {
      pluginId,
      extensionId,
      sourceCode,
      extensionType,
      property,
      pluginBaseUrl,
      primitive,
      widget,
      block,
      sceneProperty,
    },
  );

  return !skip && (src || sourceCode) ? (
    <P
      className={className}
      style={style}
      src={src}
      sourceCode={sourceCode}
      isMarshalable={isMarshalable}
      staticExposed={staticExposed}
      exposed={exposed}
      onError={handleError}
      onMessage={handleMessage}
      canBeVisible={visible}
    />
  ) : null;

  return null;
}
