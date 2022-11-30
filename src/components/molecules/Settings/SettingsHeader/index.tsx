import { useCallback, useState } from "react";

import Button from "@reearth/components/atoms/Button";
import Flex from "@reearth/components/atoms/Flex";
import Modal from "@reearth/components/atoms/Modal";
import Text from "@reearth/components/atoms/Text";
import { useT } from "@reearth/i18n";
import { styled, useTheme } from "@reearth/theme";
import { metricsSizes } from "@reearth/theme/metrics";

export type Props = {
  title?: string;
  currentWorkspace?: {
    name: string;
    personal?: boolean;
    policy?: {
      id: string;
      name: string;
    } | null;
  };
  currentProject?: string;
  onChange?: (name: string) => void;
};

const SettingsHeader: React.FC<Props> = ({ title, currentWorkspace, currentProject }) => {
  const t = useT();
  const theme = useTheme();

  const { name: workspaceName, policy } = currentWorkspace ?? {};

  const [policyModalOpen, setPolicyModal] = useState(false);

  const handlePolicyModalOpen = useCallback(() => setPolicyModal(true), []);

  const handlePolicyModalClose = useCallback(() => setPolicyModal(false), []);

  return (
    <Wrapper>
      <Flex gap={12} align="center">
        <Text size="xl" color={theme.main.strongText} weight="bold">
          {workspaceName} {workspaceName && (title || currentProject) && " / "}
          {currentProject} {currentProject && title && " / "}
          {title}
        </Text>
        {policy?.name && !currentProject && !title && (
          <>
            <PolicyText size="m" weight="bold" onClick={handlePolicyModalOpen}>
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
                <PolicyLink href="https://reearth.io/service/cloud" target="_blank">
                  {t("here")}
                </PolicyLink>
                .
              </Text>
            </Modal>
          </>
        )}
      </Flex>
      {currentWorkspace?.personal && (
        <Text size="m" color={theme.main.text} otherProperties={{ marginTop: "12px" }}>
          {t("(Your personal workspace)")}
        </Text>
      )}
    </Wrapper>
  );
};

export default SettingsHeader;

const Wrapper = styled.div`
  padding: ${metricsSizes["l"]}px 0;
`;

const PolicyText = styled(Text)`
  background: #2b2a2f;
  padding: 4px 20px;
  border-radius: 12px;
  user-select: none;
  transition: background 0.2s;
  cursor: pointer;

  :hover {
    background: #3f3d45;
  }
`;

const PolicyLink = styled.a`
  text-decoration: underline;
  color: ${({ theme }) => theme.main.accent};

  :hover {
    color: ${({ theme }) => theme.main.select};
  }
`;
