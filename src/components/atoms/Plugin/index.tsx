import React, {
  forwardRef,
  ForwardRefRenderFunction,
  IframeHTMLAttributes,
  ReactNode,
} from "react";

import useHook, { IFrameAPI, RefType } from "./hooks";
import IFrame, { AutoResize as AutoResizeType } from "./IFrame";

export { defaultIsMarshalable } from "./hooks";
export type { IFrameAPI } from "./hooks";
export type AutoResize = AutoResizeType;
export type Ref = RefType;

export type Props = {
  className?: string;
  canBeVisible?: boolean;
  skip?: boolean;
  src?: string;
  sourceCode?: string;
  renderPlaceholder?: ReactNode;
  autoResize?: AutoResize;
  iFrameProps?: IframeHTMLAttributes<HTMLIFrameElement>;
  isMarshalable?: boolean | "json" | ((target: any) => boolean | "json");
  exposed?: ((api: IFrameAPI) => { [key: string]: any }) | { [key: string]: any };
  onMessage?: (message: any) => void;
  onPreInit?: () => void;
  onError?: (err: any) => void;
  onDispose?: () => void;
  onClick?: () => void;
};

const Plugin: ForwardRefRenderFunction<RefType, Props> = (
  {
    className,
    canBeVisible,
    skip,
    src,
    sourceCode,
    renderPlaceholder,
    autoResize,
    iFrameProps,
    isMarshalable,
    exposed,
    onMessage,
    onPreInit,
    onError,
    onDispose,
    onClick,
  },
  ref,
) => {
  const { iFrameRef, iFrameHtml, iFrameVisible } = useHook({
    iframeCanBeVisible: canBeVisible,
    skip,
    src,
    sourceCode,
    isMarshalable,
    exposed,
    ref,
    onPreInit,
    onError,
    onDispose,
  });

  return iFrameHtml ? (
    <IFrame
      autoResize={autoResize}
      className={className}
      html={iFrameHtml}
      ref={iFrameRef}
      visible={iFrameVisible}
      onMessage={onMessage}
      iFrameProps={iFrameProps}
      onClick={onClick}
    />
  ) : renderPlaceholder ? (
    <>{renderPlaceholder}</>
  ) : null;
};

export default forwardRef(Plugin);
