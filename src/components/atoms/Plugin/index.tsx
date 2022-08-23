import { forwardRef, ForwardRefRenderFunction, IframeHTMLAttributes, ReactNode } from "react";

import useHook, {
  defaultIsMarshalable,
  type IFrameAPI as IFrameAPIType,
  type RefType,
} from "./hooks";
import IFrame, { AutoResize as AutoResizeType } from "./IFrame";

export { defaultIsMarshalable };
export type AutoResize = AutoResizeType;
export type Ref = RefType;
export type IFrameAPI = IFrameAPIType;

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
  isModal?: boolean;
  exposed?:
    | ((api: IFrameAPI, modalApi: IFrameAPI) => { [key: string]: any })
    | { [key: string]: any };
  onMessage?: (message: any) => void;
  onPreInit?: () => void;
  onError?: (err: any) => void;
  onDispose?: () => void;
  onClick?: () => void;
  onModalChange?: (html?: string | undefined) => void;
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
    isModal,
    onModalChange,
    exposed,
    onMessage,
    onPreInit,
    onError,
    onDispose,
    onClick,
  },
  ref,
) => {
  const { iFrameRef, iFrameHtml, iFrameOptions, handleIFrameLoad } = useHook({
    iframeCanBeVisible: canBeVisible,
    skip,
    src,
    sourceCode,
    isMarshalable,
    ref,
    isModal,
    onModalChange,
    exposed,
    onPreInit,
    onError,
    onDispose,
  });

  return iFrameHtml ? (
    <IFrame
      autoResize={autoResize}
      className={className}
      html={iFrameHtml}
      width={iFrameOptions?.width}
      height={iFrameOptions?.height}
      visible={iFrameOptions?.visible}
      iFrameProps={iFrameProps}
      ref={iFrameRef}
      onMessage={onMessage}
      onClick={onClick}
      onLoad={handleIFrameLoad}
    />
  ) : renderPlaceholder ? (
    <>{renderPlaceholder}</>
  ) : null;
};

export default forwardRef(Plugin);
