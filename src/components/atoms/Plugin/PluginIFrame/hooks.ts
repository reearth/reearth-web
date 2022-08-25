import { ForwardedRef, useCallback, useImperativeHandle } from "react";

import useIFrame, { IFrameAPI } from "./useIFrame";

export type { IFrameAPI } from "./useIFrame";

export type Ref = {
  api: IFrameAPI;
  reset: () => void;
};

export default function useHooks({
  ref,
  loaded,
  visible,
  type,
  onRender,
}: {
  ref?: ForwardedRef<Ref>;
  loaded?: boolean;
  visible?: boolean;
  type?: string;
  onRender?: (type: string) => void;
}) {
  const handleRender = useCallback(() => type && onRender?.(type), [type, onRender]);

  const {
    ref: IFrameRef,
    api,
    html,
    options,
    handleLoad,
    reset,
  } = useIFrame({
    loaded,
    visible,
    onRender: handleRender,
  });

  useImperativeHandle(
    ref,
    (): Ref => ({
      api,
      reset,
    }),
  );

  return {
    ref: IFrameRef,
    html,
    options,
    handleLoad,
  };
}
