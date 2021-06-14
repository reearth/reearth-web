import React, { CSSProperties } from "react";
import useHook, { RefType } from "./hooks";

export type Ref = RefType;

export type Props = {
  autoResize?: boolean;
  className?: string;
  html?: string;
  style?: CSSProperties;
  visible?: boolean;
  onLoad?: () => void;
  onMessage?: (message: any) => void;
};

const PluginIFrame: React.ForwardRefRenderFunction<Ref, Props> = (
  { autoResize, className, html, style, visible, onLoad, onMessage },
  ref,
) => {
  const { ref: iFrameRef, width, height, onLoad: onIFrameLoad } = useHook({
    autoResize,
    html,
    ref,
    onLoad,
    onMessage,
  });

  return html ? (
    <iframe
      frameBorder="no"
      scrolling={autoResize ? "no" : undefined}
      data-testid="iframe"
      srcDoc=""
      key={html}
      ref={iFrameRef}
      style={{
        ...style,
        display: visible ? undefined : "none",
        width: visible ? (autoResize ? width : "100%") : "0px",
        height: visible ? (autoResize ? height : "100%") : "0px",
        minWidth: "100%",
      }}
      className={className}
      onLoad={onIFrameLoad}></iframe>
  ) : null;
};

export default React.forwardRef(PluginIFrame);
