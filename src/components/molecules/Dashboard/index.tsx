import React from "react";

import Loading from "@reearth/components/atoms/Loading";
import { styled } from "@reearth/theme";

export * from "./types";

export type Props = {
  className?: string;
  header?: React.ReactNode;
  isLoading?: boolean;
  hasMoreProjects?: boolean;
  onGetMoreProjects?: () => void;
};
function handleScroll(
  { currentTarget }: React.UIEvent<HTMLDivElement, UIEvent>,
  onLoadMore?: () => void,
) {
  if (currentTarget.scrollTop + currentTarget.clientHeight >= currentTarget.scrollHeight) {
    onLoadMore?.();
  }
}

const Dashboard: React.FC<Props> = ({
  className,
  header,
  children,
  isLoading,
  hasMoreProjects,
  onGetMoreProjects,
}) => {
  return (
    <Wrapper
      className={className}
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
