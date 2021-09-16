import React, { CSSProperties } from "react";

import P, { Props as PluginProps } from "@reearth/components/atoms/Plugin";
import { Primitive, Widget, Block } from "@reearth/plugin";

import useHooks from "./hooks";

export type { Primitive, Block, Widget } from "@reearth/plugin";

export type Props = {
  className?: string;
  style?: CSSProperties;
  sourceCode?: string;
  pluginId?: string;
  extensionId?: string;
  extensionType?: string;
  visible?: boolean;
  iFrameProps?: PluginProps["iFrameProps"];
  property?: any;
  sceneProperty?: any;
  pluginProperty?: any;
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
  iFrameProps,
  property,
  visible,
  pluginBaseUrl = "/plugins",
  primitive,
  widget,
  block,
  sceneProperty,
  pluginProperty,
}: Props): JSX.Element | null {
  const { skip, src, isMarshalable, staticExposed, handleError, handleMessage } = useHooks({
    pluginId,
    extensionId,
    extensionType,
    property,
    pluginBaseUrl,
    primitive,
    widget,
    block,
    sceneProperty,
    pluginProperty,
  });

  return !skip && (src || sourceCode) ? (
    <P
      className={className}
      style={style}
      src={src}
      sourceCode={sourceCode}
      iFrameProps={iFrameProps}
      canBeVisible={visible}
      isMarshalable={isMarshalable}
      staticExposed={staticExposed}
      onError={handleError}
      onMessage={handleMessage}
    />
  ) : null;

  return null;
}
