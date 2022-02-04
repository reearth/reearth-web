import React, { IframeHTMLAttributes } from "react";

import useHook, { RefType } from "./hooks";

export type Ref = RefType;

export type Props = {
  autoResizeHorizontally?: boolean;
  autoResizeVertically?: boolean;
  className?: string;
  html?: string;
  visible?: boolean;
  iFrameProps?: IframeHTMLAttributes<HTMLIFrameElement>;
  onLoad?: () => void;
  onMessage?: (message: any) => void;
  onClick?: () => void;
};

const IFrame: React.ForwardRefRenderFunction<Ref, Props> = (
  {
    autoResizeHorizontally,
    autoResizeVertically,
    className,
    html,
    visible,
    iFrameProps,
    onLoad,
    onMessage,
    onClick,
  },
  ref,
) => {
  const {
    ref: iFrameRef,
    props,
    onLoad: onIFrameLoad,
  } = useHook({
    visible,
    iFrameProps,
    autoResizeHorizontally,
    autoResizeVertically,
    html,
    ref,
    onLoad,
    onMessage,
    onClick,
  });

  return html ? (
    <iframe
      frameBorder="no"
      scrolling={autoResizeHorizontally || autoResizeVertically ? "no" : undefined}
      data-testid="iframe"
      srcDoc=""
      key={html}
      ref={iFrameRef}
      className={className}
      onLoad={onIFrameLoad}
      {...props}
    />
  ) : null;
};

export default React.forwardRef(IFrame);
