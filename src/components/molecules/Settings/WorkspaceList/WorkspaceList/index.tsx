import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import WorkspaceCell from "@reearth/components/molecules/Settings/WorkspaceList/WorkspaceCell";
import Button from "@reearth/components/atoms/Button";
import { styled, useTheme } from "@reearth/theme";
import { Team as TeamType } from "@reearth/gql/graphql-client-api";
import Text from "@reearth/components/atoms/Text";

export type Team = TeamType;

export type Props = {
  title?: string;
  teams?: Team[];
  currentTeam?: {
    id: string;
    name: string;
  };
  filterQuery?: string;
  onWorkspaceSelect?: (team: Team) => void;
  onCreationButtonClick?: () => void;
};

const WorkspaceList: React.FC<Props> = ({
  teams,
  currentTeam,
  title,
  filterQuery,
  onWorkspaceSelect,
  onCreationButtonClick,
}) => {
  const intl = useIntl();
  const filteredWorkspaces = useMemo(
    () =>
      filterQuery
        ? teams?.filter(t => t.name.toLowerCase().indexOf(filterQuery.toLowerCase()) !== -1)
        : teams,
    [filterQuery, teams],
  );
  const theme = useTheme();

  return (
    <>
      <SubHeader>
        <Text
          size="m"
          color={theme.main.strongText}
          weight="bold"
          otherProperties={{ margin: "14px 0" }}>
          {title ||
            `${intl.formatMessage({ defaultMessage: "All workspaces" })} (${
              filteredWorkspaces?.length || 0
            })`}
        </Text>
        <Button
          large
          buttonType="secondary"
          text={intl.formatMessage({ defaultMessage: "New Workspace" })}
          onClick={onCreationButtonClick}
        />
      </SubHeader>
      <StyledListView>
        {filteredWorkspaces?.map(team => {
          return team.id === currentTeam?.id ? (
            <StyledWorkspaceCell
              team={team}
              key={team.id}
              onSelect={onWorkspaceSelect}
              personal={team.personal}
            />
          ) : (
            <WorkspaceCell
              team={team}
              key={team.id}
              onSelect={onWorkspaceSelect}
              personal={team.personal}
            />
          );
        })}
      </StyledListView>
    </>
  );
};

const SubHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: solid 1px #3f3d45;
  margin: 20px 0;
`;

const StyledListView = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const StyledWorkspaceCell = styled(WorkspaceCell)`
  border: ${props => `1px solid ${props.theme.main.highlighted}`};
`;

export default WorkspaceList;
