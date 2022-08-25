import { forwardRef, ForwardRefRenderFunction, IframeHTMLAttributes, ReactNode } from "react";

import IFrame, { AutoResize } from "../IFrame";

import useHooks, { Ref } from "./hooks";

export type { AutoResize } from "../IFrame";
export type { IFrameAPI, Ref } from "./hooks";

export type Props = {
  className?: string;
  visible?: boolean;
  loaded?: boolean;
  autoResize?: AutoResize;
  iFrameProps?: IframeHTMLAttributes<HTMLIFrameElement>;
  renderPlaceholder?: ReactNode;
  onClick?: () => void;
  onMessage?: (message: any) => void;
};

const PluginIFrame: ForwardRefRenderFunction<Ref, Props> = (
  { className, visible, loaded, autoResize, iFrameProps, renderPlaceholder, onClick, onMessage },
  ref,
) => {
  const { ref: iFrameRef, html, options, handleLoad } = useHooks({ loaded, ref, visible });

  return (
    <>
      {html ? (
        <IFrame
          ref={iFrameRef}
          className={className}
          iFrameProps={iFrameProps}
          html={html}
          autoResize={autoResize}
          onMessage={onMessage}
          onClick={onClick}
          onLoad={handleLoad}
          {...options}
        />
      ) : renderPlaceholder ? (
        <>{renderPlaceholder}</>
      ) : null}
    </>
  );
};

export default forwardRef(PluginIFrame);
