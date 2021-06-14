import React, { CSSProperties } from "react";
import useHook, { RefType } from "./hooks";

export type Ref = RefType;

export type Props = {
  className?: string;
  style?: CSSProperties;
  html?: string;
  visible?: boolean;
  onLoad?: () => void;
  onMessage?: (message: any) => void;
};

const PluginIFrame: React.ForwardRefRenderFunction<Ref, Props> = (
  { className, style, html, visible, onLoad, onMessage },
  ref,
) => {
  const { iframeRef, onLoad: onIFrameLoad } = useHook({ ref, html, onLoad, onMessage });

  return html ? (
    <iframe
      scrolling="no"
      frameBorder="no"
      data-testid="iframe"
      srcDoc=""
      key={html}
      ref={iframeRef}
      style={{
        ...style,
        display: visible ? "block" : "none",
        width: visible ? "100%" : "0px",
        height: visible ? "100%" : "0px",
      }}
      className={className}
      onLoad={onIFrameLoad}></iframe>
  ) : null;
};

export default React.forwardRef(PluginIFrame);
