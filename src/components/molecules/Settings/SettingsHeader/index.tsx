import React from "react";
import { useIntl } from "react-intl";
import { styled, useTheme } from "@reearth/theme";
import Text from "@reearth/components/atoms/Text";

export type Props = {
  title?: string;
  currentWorkspace?: {
    name: string;
    personal?: boolean;
  };
  currentProject?: string;
  onChange?: (name: string) => void;
};

const SettingsHeader: React.FC<Props> = ({ title, currentWorkspace, currentProject }) => {
  const intl = useIntl();
  const workspace = currentWorkspace?.name;
  const theme = useTheme();

  return (
    <Wrapper>
      <Text size="xl" color={theme.main.strongText} weight="normal">
        {workspace} {workspace && (title || currentProject) && " / "}
        {currentProject} {title && currentProject && " / "}
        {title}
      </Text>
      <Text size="m" className={theme.main.text} otherProperties={{ marginTop: "12px" }}>
        {currentWorkspace?.personal &&
          intl.formatMessage({ defaultMessage: "(Your personal workspace)" })}
      </Text>
    </Wrapper>
  );
};

const Wrapper = styled.div``;

export default SettingsHeader;
