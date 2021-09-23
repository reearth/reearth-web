import React, { CSSProperties } from "react";

import P, { Props as PluginProps } from "@reearth/components/atoms/Plugin";

import useHooks from "./hooks";
import type { Layer, Block, Widget } from "./types";

export type { Layer, Block, Widget, InfoboxProperty } from "./types";

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
  layer?: Layer;
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
  layer,
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
    layer,
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
