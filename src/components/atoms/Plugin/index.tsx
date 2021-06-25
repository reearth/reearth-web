import React, { CSSProperties } from "react";

import useHook, { IFrameAPI as IFrameAPIType } from "./hooks";
import IFrame from "./IFrame";

export type IFrameAPI = IFrameAPIType;

export type Props = {
  className?: string;
  canBeVisible?: boolean;
  onMessageCode?: string;
  onUpdateCode?: string;
  skip?: boolean;
  style?: CSSProperties;
  src?: string;
  exposed?: { [key: string]: any };
  staticExposed?: (api: IFrameAPI) => any;
  onError?: (err: any) => void;
};

const Plugin: React.FC<Props> = ({
  className,
  canBeVisible,
  onMessageCode,
  onUpdateCode,
  skip,
  style,
  src,
  exposed,
  staticExposed,
  onError,
}) => {
  const { iFrameRef, iFrameHtml, iFrameVisible, onMessage } = useHook({
    iframeCanBeVisible: canBeVisible,
    onMessageCode,
    onUpdateCode,
    skip,
    src,
    exposed,
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
