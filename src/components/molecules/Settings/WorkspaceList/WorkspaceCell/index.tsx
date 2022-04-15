import React from "react";
import { useIntl } from "react-intl";
import { useMedia } from "react-use";

import Flex from "@reearth/components/atoms/Flex";
import Text from "@reearth/components/atoms/Text";
import { styled, useTheme } from "@reearth/theme";
import { metricsSizes } from "@reearth/theme/metrics";

import Avatar from "../../Avatar";
import { Team as TeamType } from "../WorkspaceList";

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
  const isSmallWindow = useMedia("(max-width: 1024px)");

  return (
    <Wrapper
      className={className}
      direction="column"
      justify="space-between"
      onClick={() => onSelect?.(team)}>
      <Text size="xl" color={theme.main.text} otherProperties={{ userSelect: "none" }}>
        {team.name ? team.name : intl.formatMessage({ defaultMessage: "No Title Workspace" })}
      </Text>
      {personal ? (
        <Text size="m" color={theme.main.weak}>
          {intl.formatMessage({
            defaultMessage:
              "This is your personal workspace. Your projects and resources will be managed in this workspace.",
          })}
        </Text>
      ) : (
        <Flex align="center" justify="flex-start">
          <Text
            size="m"
            color={theme.main.text}
            otherProperties={{ margin: `${metricsSizes["s"]}px 0` }}>
            {intl.formatMessage({ defaultMessage: "Members:" })}
          </Text>
          <Flex wrap="wrap">
            {teamMembers.map(member => (
              <StyledItem key={member.userId} size={32} color={theme.main.avatarbg} radius={50}>
                <Text size={isSmallWindow ? "m" : "l"} color={theme.text.pale}>
                  {member.user?.name.charAt(0).toUpperCase()}
                </Text>
              </StyledItem>
            ))}
          </Flex>
        </Flex>
      )}
    </Wrapper>
  );
};

const Wrapper = styled(Flex)`
  background: ${props => props.theme.main.lighterBg};
  box-sizing: border-box;
  box-shadow: 0 0 5px ${props => props.theme.projectCell.shadow};
  padding: ${metricsSizes["l"]}px ${metricsSizes["2xl"]}px;
  height: 240px;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.main.paleBg};
  }
`;

const StyledItem = styled(Avatar)`
  margin: ${metricsSizes["s"]}px;
`;

export default WorkspaceCell;
