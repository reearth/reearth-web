import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useMedia } from "react-use";

import Avatar from "@reearth/components/atoms/Avatar";
import DashboardBlock from "@reearth/components/atoms/DashboardBlock";
import Flex from "@reearth/components/atoms/Flex";
import HelpButton from "@reearth/components/atoms/HelpButton";
import Icon from "@reearth/components/atoms/Icon";
import Text from "@reearth/components/atoms/Text";
import { Team as TeamType } from "@reearth/components/molecules/Dashboard/types";
import { useT } from "@reearth/i18n";
import { styled, useTheme, metrics } from "@reearth/theme";
import { metricsSizes } from "@reearth/theme/metrics";

import { Member } from "./types";

export type Props = {
  className?: string;
  team?: TeamType;
  isPersonal?: boolean;
};

const Workspace: React.FC<Props> = ({ className, team, isPersonal }) => {
  const theme = useTheme();
  const t = useT();
  const isSmallWindow = useMedia("(max-width: 1024px)");

  const { name, members, policy } = team ?? {};

  const teamLength = useMemo(() => team?.members?.length ?? 0, [team?.members]);
  const excessMembers = useMemo(() => teamLength - 5 ?? 0, [teamLength]);

  const shownMembers: Member[] | undefined = useMemo(() => members?.slice(0, 5), [members]);

  return (
    <StyledDashboardBlock className={className} grow={5}>
      <Content direction="column" justify="space-between">
        <WorkspaceHeader align="center" gap={12} wrap="wrap">
          <Text size={isSmallWindow ? "m" : "xl"} color={theme.main.text} weight="bold">
            {name}
            {isPersonal && t("'s workspace")}
          </Text>
          {policy?.name && (
            <HelpButton
              balloonDirection="right-start"
              descriptionTitle={policy.name}
              description={t(
                `Your workspace is currently a ${policy.name} workspace. If you would like to know the details of your plan, or change your plan, please click this button.
                `,
              )}
              mouseEnterDelay={250}>
              <PolicyText
                size={isSmallWindow ? "xs" : "m"}
                weight="bold"
                smallWindow={isSmallWindow}>
                {policy.name}
              </PolicyText>
            </HelpButton>
          )}
        </WorkspaceHeader>
        <Flex>
          <Flex flex={4}>
            {shownMembers?.map((member: Member) => (
              <StyledAvatar key={member?.user.id} innerText={member?.user.name} />
            ))}
            {excessMembers > 0 && <Avatar innerText={excessMembers} />}
          </Flex>
          <StyledLink to={`/settings/workspaces/${team?.id}`}>
            <StyledIcon icon="settings" />
          </StyledLink>
        </Flex>
      </Content>
    </StyledDashboardBlock>
  );
};

const StyledDashboardBlock = styled(DashboardBlock)`
  flex-grow: 5;
  @media only screen and (max-width: 1024px) {
    order: 3;
  }
`;

const WorkspaceHeader = styled(Flex)``;

const PolicyText = styled(Text)<{ smallWindow?: boolean }>`
  background: #2b2a2f;
  padding: ${({ smallWindow }) => (smallWindow ? "2px 10px" : "4px 20px")};
  border-radius: 12px;
  user-select: none;
  cursor: pointer;
  transition: background 0.2s;

  :hover {
    background: #3f3d45;
  }
`;

const Content = styled(Flex)`
  letter-spacing: 1px;
  min-width: ${metrics.dashboardWorkspaceMinWidth}px;
  height: ${metrics.dashboardContentHeight}px;
  padding: ${metricsSizes.xl}px;
  color: ${({ theme }) => theme.main.text};

  @media only screen and (max-width: 1024px) {
    order: 3;
    height: ${metrics.dashboardContentSmallHeight}px;
  }
`;

const StyledIcon = styled(Icon)`
  border-radius: 5px;
  padding: ${metricsSizes["2xs"]}px;
  color: ${props => props.theme.main.text};

  &:hover {
    background: ${props => props.theme.main.bg};
  }
`;

const StyledLink = styled(Link)`
  color: ${props => props.theme.main.text};
  text-decoration: none;
  display: flex;
  align-items: center;

  &:hover {
    text-decoration: none;
  }
`;

const StyledAvatar = styled(Avatar)`
  margin-right: ${metricsSizes["s"]}px;
`;

export default Workspace;
