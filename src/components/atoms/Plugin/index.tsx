import React, { CSSProperties } from "react";

import useHook, { IFrameAPI } from "./hooks";
import IFrame from "./IFrame";

export type Props = {
  className?: string;
  canBeVisible?: boolean;
  onMessageCode?: string;
  skip?: boolean;
  style?: CSSProperties;
  src?: string;
  onError?: (err: any) => void;
  onExpose?: (api: IFrameAPI) => any;
};

const Plugin: React.FC<Props> = ({
  className,
  canBeVisible,
  onMessageCode,
  skip,
  style,
  src,
  onError,
  onExpose,
}) => {
  const { iframeAutoResize, iFrameRef, iFrameHtml, iFrameVisible, onMessage } = useHook({
    iframeCanBeVisible: canBeVisible,
    onMessageCode,
    skip,
    src,
    onError,
    onExpose,
  });

  return (
    <IFrame
      autoResize={iframeAutoResize}
      className={className}
      html={iFrameHtml}
      ref={iFrameRef}
      style={style}
      visible={iFrameVisible}
      onMessage={onMessage}
    />
  );
};

export default Plugin;
