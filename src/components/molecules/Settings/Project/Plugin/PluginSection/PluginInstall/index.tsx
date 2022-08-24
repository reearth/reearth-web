import React from "react";

import Box from "@reearth/components/atoms/Box";
import Flex from "@reearth/components/atoms/Flex";
import { Icons } from "@reearth/components/atoms/Icon";
import Text from "@reearth/components/atoms/Text";
import { useT } from "@reearth/i18n";
import { styled } from "@reearth/theme";

import { PluginInstallWay } from "..";
import PluginAccordion, { PluginItem } from "../../PluginAccordion";

import PublicRepo from "./PublicRepo";
import ZipUpload from "./ZipUpload";

export type Props = {
  installedPlugins?: PluginItem[];
  installFromPublicRepo: (repoUrl: string) => void;
  installByUploadingZipFile: (files: FileList) => void;
  uninstallPlugin: (pluginId: string) => void;
};

const PluginInstall: React.FC<Props> = ({
  installedPlugins,
  installFromPublicRepo,
  installByUploadingZipFile,
  uninstallPlugin,
}) => {
  const t = useT();
  const installChoices: { text: string; mode: PluginInstallWay; icon: Icons }[] = [
    {
      text: t("Zip file from PC"),
      mode: "install-zip",
      icon: "uploadZipPlugin",
    },
    {
      text: t("Public GitHub repository"),
      mode: "install-public-repo",
      icon: "publicGitHubRepo",
    },
    // {
    //   text: t("Private GitHub repository"),
    //   mode: "install-private-repo",
    //   icon: "privateGitHubRepo",
    // },
  ];

  return (
    <>
      <Box pv="2xl">
        <Flex gap={28}>
          {installChoices.map(c => {
            return c.mode === "install-public-repo" ? (
              <PublicRepo
                key={c.mode}
                icon={c.icon}
                buttonText={c.text}
                onSend={installFromPublicRepo}
              />
            ) : c.mode === "install-zip" ? (
              <ZipUpload
                key={c.mode}
                icon={c.icon}
                buttonText={c.text}
                onSend={installByUploadingZipFile}
              />
            ) : null;
          })}
        </Flex>
      </Box>
      <StyledBox pb="s">
        <StyledText weight="bold" size="m" customColor>
          {t("Installed")}
        </StyledText>
      </StyledBox>
      <PluginAccordion items={installedPlugins} uninstallPlugin={uninstallPlugin} />
    </>
  );
};

const StyledBox = styled(Box)`
  border-bottom: ${props => `solid 1px ${props.theme.main.border}`};
`;

const StyledText = styled(Text)`
  color: ${({ theme }) => theme.text.pale};
`;

export default PluginInstall;
