import React, { CSSProperties } from "react";

import useHook, { IFrameAPI as IFrameAPIType } from "./hooks";
import IFrame from "./IFrame";

export type IFrameAPI = IFrameAPIType;

export type Props = {
  className?: string;
  canBeVisible?: boolean;
  skip?: boolean;
  style?: CSSProperties;
  src?: string;
  sourceCode?: string;
  exposed?: { [key: string]: any };
  isMarshalable?: (target: any) => boolean;
  staticExposed?: (api: IFrameAPI) => any;
  onMessage?: (message: any) => void;
  onError?: (err: any) => void;
};

const Plugin: React.FC<Props> = ({
  className,
  canBeVisible,
  skip,
  style,
  src,
  sourceCode,
  exposed,
  isMarshalable,
  staticExposed,
  onMessage,
  onError,
}) => {
  const { iFrameRef, iFrameHtml, iFrameVisible } = useHook({
    iframeCanBeVisible: canBeVisible,
    skip,
    src,
    sourceCode,
    exposed,
    isMarshalable,
    staticExposed,
    onError,
  });

  return iFrameHtml ? (
    <IFrame
      autoResize
      className={className}
      style={style}
      html={iFrameHtml}
      ref={iFrameRef}
      visible={iFrameVisible}
      onMessage={onMessage}
    />
  ) : null;
};

export default Plugin;
