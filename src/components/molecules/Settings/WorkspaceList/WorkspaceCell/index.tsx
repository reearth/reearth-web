import React from "react";
import { useIntl } from "react-intl";

// Components
import { styled, useTheme } from "@reearth/theme";
import { Team as TeamType } from "../WorkspaceList";
import Text from "@reearth/components/atoms/Text";
import Icon from "@reearth/components/atoms/Icon";

export type Team = TeamType;

export type Props = {
  className?: string;
  team: Team;
  personal: boolean;
  onSelect?: (t: Team) => void;
};

const WorkspaceCell: React.FC<Props> = ({ className, team, personal, onSelect }) => {
  const intl = useIntl();
  const teamMembers = team.members;
  const theme = useTheme();

  return (
    <Wrapper className={className} team={team}>
      <TopWrapper>
        <Text size="xl" color={theme.main.text} otherProperties={{ userSelect: "none" }}>
          {personal
            ? team.name + "'s Personal Workspace"
            : team.name
            ? team.name
            : intl.formatMessage({ defaultMessage: "No Title Workspace" })}
        </Text>
        <StyledIcon icon="settings" size={24} onClick={() => onSelect?.(team)} />
      </TopWrapper>
      {personal ? (
        <Text size="m" color={theme.colors.text.weak}>
          {intl.formatMessage({
            defaultMessage:
              "This is your personal workspace, your projects and resource will be managed in this workspace.",
          })}
        </Text>
      ) : (
        <BottomWrapper>
          <Text size="m" color={theme.main.text}>
            {intl.formatMessage({ defaultMessage: "Members:" })}
          </Text>
          <StyledList>
            {teamMembers.map(member => (
              <StyledListItem key={member.userId}>
                <Text size="m" color={theme.main.text}>
                  {member?.user?.name}
                </Text>
              </StyledListItem>
            ))}
          </StyledList>
        </BottomWrapper>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div<{ team: Team }>`
  background: ${props => props.theme.colors.bg[3]};
  box-sizing: border-box;
  box-shadow: 0 0 5px ${props => props.theme.projectCell.shadow};
  padding: 16px 24px;
  height: 240px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const TopWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const BottomWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const StyledList = styled.ul`
  margin: 0;
  padding: 0;
`;

const StyledListItem = styled.li`
  list-style-type: none;
  margin: 8px;
`;

const StyledIcon = styled(Icon)`
  border-radius: 4px;
  margin-bottom: 12px;
  padding: 4px;
  color: ${({ theme }) => theme.colors.text.main};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.bg[5]};
  }
`;

export default WorkspaceCell;
