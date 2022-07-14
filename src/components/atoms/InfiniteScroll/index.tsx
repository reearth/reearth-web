import React, { ReactNode, useEffect, useRef } from "react";

import { styled } from "@reearth/theme";

import useHooks from "./hooks";

type Props = {
  className?: string;
  loading?: boolean;
  hasMoreItems?: boolean;
  children?: ReactNode;
  onGetMoreItems?: () => void;
};

const InfiniteScrollWrapper: React.FC<Props> = ({
  className,
  loading,
  hasMoreItems,
  onGetMoreItems,
  children,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { handleAutoFillPage, handleScrollToBottom } = useHooks(onGetMoreItems);

  useEffect(() => {
    if (wrapperRef.current && !loading && hasMoreItems) handleAutoFillPage(wrapperRef);
  }, [handleAutoFillPage, hasMoreItems, loading, onGetMoreItems]);

  return (
    <Wrapper
      ref={wrapperRef}
      className={className}
      onScroll={e => !loading && hasMoreItems && handleScrollToBottom(e)}>
      {children}
    </Wrapper>
  );
};
const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
`;
export default React.memo(InfiniteScrollWrapper);
