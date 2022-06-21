import { ReactNode, useEffect, useRef } from "react";

import Loading from "@reearth/components/atoms/Loading";
import { styled } from "@reearth/theme";
import { AutoFetchMore } from "@reearth/util/AutoFetchMore";
import { handleScroll } from "@reearth/util/handleScroll";

export * from "./types";

export type Props = {
  className?: string;
  children?: ReactNode;
  header?: ReactNode;
  isLoading?: boolean;
  hasMoreProjects?: boolean;
  onGetMoreProjects?: () => void;
};

const Dashboard: React.FC<Props> = ({
  className,
  header,
  children,
  isLoading,
  hasMoreProjects,
  onGetMoreProjects,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (wrapperRef.current && !isLoading && hasMoreProjects)
      AutoFetchMore(wrapperRef, onGetMoreProjects);
  }, [hasMoreProjects, isLoading, onGetMoreProjects]);
  return (
    <Wrapper
      className={className}
      ref={wrapperRef}
      onScroll={e => {
        !isLoading && hasMoreProjects && handleScroll(e, onGetMoreProjects);
      }}>
      {header}
      <Content>
        {children}
        {isLoading && hasMoreProjects && <StyledLoading relative />}
      </Content>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  background: ${({ theme }) => theme.dashboard.bg};
  height: 100%;
  overflow: auto;
`;

const Content = styled.div`
  margin: 10px;
  display: flex;
  flex-wrap: wrap;
`;
const StyledLoading = styled(Loading)`
  margin: 52px auto;
`;

export default Dashboard;
