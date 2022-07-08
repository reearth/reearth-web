import { ReactNode } from "react";

import InfiniteScrollWrapper from "@reearth/components/atoms/InfiniteScroll";
import Loading from "@reearth/components/atoms/Loading";
import { styled } from "@reearth/theme";

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
  return (
    <Wrapper
      className={className}
      loading={isLoading}
      hasMoreItems={hasMoreProjects}
      onGetMoreItems={onGetMoreProjects}>
      {header}
      <Content>
        {children}
        {isLoading && hasMoreProjects && <StyledLoading relative />}
      </Content>
    </Wrapper>
  );
};

const Wrapper = styled(InfiniteScrollWrapper)`
  background: ${({ theme }) => theme.dashboard.bg};
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
