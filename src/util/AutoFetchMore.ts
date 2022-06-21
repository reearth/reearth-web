import { MutableRefObject } from "react";

export function AutoFetchMore(
  ref: MutableRefObject<HTMLDivElement | undefined | null>,
  onLoadMore?: () => void,
) {
  if (ref.current && ref.current?.scrollHeight <= document.documentElement.clientHeight) {
    onLoadMore?.();
  }
}
