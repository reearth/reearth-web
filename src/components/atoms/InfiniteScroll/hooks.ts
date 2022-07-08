import { MutableRefObject } from "react";

export default (onLoadMore?: () => void) => {
  const handleAutoFillPage = (ref: MutableRefObject<HTMLDivElement | undefined | null>) => {
    if (ref.current && ref.current?.scrollHeight <= document.documentElement.clientHeight) {
      onLoadMore?.();
    }
  };

  const handleScrollToBottom = (
    { currentTarget }: React.UIEvent<HTMLDivElement, UIEvent>,
    threshold = 5,
  ) => {
    if (
      currentTarget.scrollTop + currentTarget.clientHeight >=
      currentTarget.scrollHeight - threshold
    ) {
      onLoadMore?.();
    }
  };

  return { handleAutoFillPage, handleScrollToBottom };
};
