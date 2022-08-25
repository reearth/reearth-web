import { IframeHTMLAttributes, ReactNode } from "react";

import useHook, { defaultIsMarshalable } from "./hooks";
import PluginIFrame, { AutoResize, IFrameAPI } from "./PluginIFrame";

export { defaultIsMarshalable };

export type { AutoResize, IFrameAPI } from "./PluginIFrame";

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

export default function Plugin({
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
}: Props) {
  const { mainIFrameRef, loaded } = useHook({
    src,
    sourceCode,
    skip,
    isMarshalable,
    exposed,
    onError,
    onPreInit,
    onDispose,
  });

  return (
    <>
      <PluginIFrame
        ref={mainIFrameRef}
        loaded={loaded}
        visible={canBeVisible}
        className={className}
        iFrameProps={iFrameProps}
        autoResize={autoResize}
        renderPlaceholder={renderPlaceholder}
        onMessage={onMessage}
        onClick={onClick}
      />
    </>
  );
}
