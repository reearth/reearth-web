import React from "react";

import Flex from "@reearth/components/atoms/Flex";
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
  const { name: workspaceName, policy } = currentWorkspace ?? {};
  const theme = useTheme();

  return (
    <Wrapper>
      <Flex gap={12} align="center">
        <Text size="xl" color={theme.main.strongText} weight="bold">
          {workspaceName} {workspaceName && (title || currentProject) && " / "}
          {currentProject} {title && currentProject && " / "}
          {title}
        </Text>
        {policy?.name && !currentProject && !title && (
          <PolicyText size="m" weight="bold">
            {policy.name}
          </PolicyText>
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
`;
