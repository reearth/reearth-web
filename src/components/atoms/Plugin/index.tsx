import { IframeHTMLAttributes, ReactNode } from "react";

import useHook, { defaultIsMarshalable, IFrameType, API } from "./hooks";
import PluginIFrame, { AutoResize } from "./PluginIFrame";

export { defaultIsMarshalable };

export type { AutoResize } from "./PluginIFrame";
export type { API, IFrameType } from "./hooks";

export type Props = {
  className?: string;
  canBeVisible?: boolean;
  skip?: boolean;
  src?: string;
  sourceCode?: string;
  renderPlaceholder?: ReactNode;
  autoResize?: AutoResize;
  iFrameProps?: IframeHTMLAttributes<HTMLIFrameElement>;
  modalContainer?: HTMLElement | DocumentFragment;
  popupContainer?: HTMLElement | DocumentFragment;
  modalCanBeVisible?: boolean;
  popupCanBeVisible?: boolean;
  isMarshalable?: boolean | "json" | ((target: any) => boolean | "json");
  exposed?: ((api: API) => { [key: string]: any }) | { [key: string]: any };
  onMessage?: (message: any) => void;
  onPreInit?: () => void;
  onError?: (err: any) => void;
  onDispose?: () => void;
  onClick?: () => void;
  onRender?: (type: IFrameType) => void;
};

export default function Plugin({
  className,
  canBeVisible,
  modalCanBeVisible,
  popupCanBeVisible,
  skip,
  src,
  sourceCode,
  renderPlaceholder,
  autoResize,
  iFrameProps,
  isMarshalable,
  modalContainer,
  popupContainer,
  exposed,
  onMessage,
  onPreInit,
  onError,
  onDispose,
  onClick,
  onRender,
}: Props) {
  const { mainIFrameRef, modalIFrameRef, popupIFrameRef, loaded } = useHook({
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
        type="main"
        ref={mainIFrameRef}
        loaded={loaded}
        visible={canBeVisible}
        className={className}
        iFrameProps={iFrameProps}
        autoResize={autoResize}
        renderPlaceholder={renderPlaceholder}
        onMessage={onMessage}
        onClick={onClick}
        onRender={onRender as (type: string) => void}
      />
      <PluginIFrame
        type="modal"
        ref={modalIFrameRef}
        container={modalContainer}
        useContainer
        visible={modalCanBeVisible}
        loaded={loaded}
        autoResize="both"
        onRender={onRender as (type: string) => void}
      />
      <PluginIFrame
        type="popup"
        ref={popupIFrameRef}
        container={popupContainer}
        useContainer
        visible={popupCanBeVisible}
        loaded={loaded}
        autoResize="both"
        onRender={onRender as (type: string) => void}
      />
    </>
  );
}
