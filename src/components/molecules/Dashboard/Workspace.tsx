import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMedia } from "react-use";

import Avatar from "@reearth/components/atoms/Avatar";
import Button from "@reearth/components/atoms/Button";
import DashboardBlock from "@reearth/components/atoms/DashboardBlock";
import Flex from "@reearth/components/atoms/Flex";
import Icon from "@reearth/components/atoms/Icon";
import Modal from "@reearth/components/atoms/Modal";
import Text from "@reearth/components/atoms/Text";
import { Workspace as WorkspaceType } from "@reearth/components/molecules/Dashboard/types";
import { useT } from "@reearth/i18n";
import { styled, useTheme, metrics } from "@reearth/theme";
import { metricsSizes } from "@reearth/theme/metrics";

import { Member } from "./types";

export type Props = {
  className?: string;
  workspace?: WorkspaceType;
  isPersonal?: boolean;
};

const Workspace: React.FC<Props> = ({ className, workspace, isPersonal }) => {
  const theme = useTheme();
  const t = useT();
  const isSmallWindow = useMedia("(max-width: 1024px)");

  const [policyModalOpen, setPolicyModal] = useState(false);

  const { name, members, policy } = workspace ?? {};

  const workspaceMemberCount = useMemo(() => workspace?.members?.length ?? 0, [workspace?.members]);
  const excessMembers = useMemo(() => workspaceMemberCount - 5 ?? 0, [workspaceMemberCount]);

  const shownMembers: Member[] | undefined = useMemo(() => members?.slice(0, 5), [members]);

  const handlePolicyModalOpen = useCallback(() => setPolicyModal(true), []);

  const handlePolicyModalClose = useCallback(() => setPolicyModal(false), []);

  return (
    <StyledDashboardBlock className={className} grow={5}>
      <Content direction="column" justify="space-between">
        <WorkspaceHeader align="center" gap={12} wrap="wrap">
          <Text size={isSmallWindow ? "m" : "xl"} color={theme.main.text} weight="bold">
            {name}
            {isPersonal && t("'s workspace")}
          </Text>
          {policy?.name && (
            <>
              <PolicyText
                size={isSmallWindow ? "xs" : "m"}
                weight="bold"
                smallWindow={isSmallWindow}
                onClick={handlePolicyModalOpen}>
                {policy.name}
              </PolicyText>
              <Modal
                title={t("Check your plan")}
                size="sm"
                isVisible={policyModalOpen}
                button1={
                  <Button large onClick={handlePolicyModalClose}>
                    {t("OK")}
                  </Button>
                }
                onClose={handlePolicyModalClose}>
                <Text size="m">
                  {t(`Your workspace is currently a ${policy.name} workspace. If you would like to know the
               details of your plan, or change your plan, please click `)}
                  <PolicyLink href="https://www.reearth.io/policy" target="_blank">
                    {t("here")}
                  </PolicyLink>
                  .
                </Text>
              </Modal>
            </>
          )}
        </WorkspaceHeader>
        <Flex>
          <Flex flex={4}>
            {shownMembers?.map((member: Member) => (
              <StyledAvatar key={member?.user.id} innerText={member?.user.name} />
            ))}
            {excessMembers > 0 && <Avatar innerText={excessMembers} />}
          </Flex>
          <StyledLink to={`/settings/workspaces/${workspace?.id}`}>
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

const PolicyLink = styled.a`
  text-decoration: underline;
  color: ${({ theme }) => theme.main.accent};

  :hover {
    color: ${({ theme }) => theme.main.select};
  }
`;

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
