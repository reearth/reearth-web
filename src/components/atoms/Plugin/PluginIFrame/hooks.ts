import { ForwardedRef, useImperativeHandle } from "react";

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
}: {
  ref?: ForwardedRef<Ref>;
  loaded?: boolean;
  visible?: boolean;
}) {
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
