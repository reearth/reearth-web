import React, { CSSProperties } from "react";

import useHook from "./hooks";
import PluginIFrame from "./PluginIFrame";

export type Props = {
  className?: string;
  canBeVisible?: boolean;
  onMessageCode?: string;
  skip?: boolean;
  style?: CSSProperties;
  src?: string;
  onError?: (err: any) => void;
  onExpose?: (api: {
    render: (html: string, visible?: boolean) => void;
    postMessage: (message: any) => void;
  }) => any;
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
  const { iFrameRef, iFrameHtml, iFrameVisible, onMessage } = useHook({
    iframeCanBeVisible: canBeVisible,
    onMessageCode,
    skip,
    src,
    onError,
    onExpose,
  });

  return (
    <PluginIFrame
      className={className}
      style={style}
      ref={iFrameRef}
      html={iFrameHtml}
      visible={iFrameVisible}
      onMessage={onMessage}
    />
  );
};

export default Plugin;
