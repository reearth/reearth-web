import Box from "@reearth/components/atoms/Box";
import Flex from "@reearth/components/atoms/Flex";
import { Icons } from "@reearth/components/atoms/Icon";
import Text from "@reearth/components/atoms/Text";
import { styled } from "@reearth/theme";
import React from "react";
import { useIntl } from "react-intl";
import { PluginInstallWay, PluginPageMode } from "..";
import PluginAccordion, { PluginItem } from "../../PluginAccordion";
import PublicRepo from "./PublicRepo";
import ZipUpload from "./ZipUpload";

export type Props = {
  className?: string;
  onMovePrevPage?: () => void;
  onMovePage?: (mode: PluginPageMode) => void;
  installedPlugins?: PluginItem[];
};

const PluginInstall: React.FC<Props> = ({ className, installedPlugins }) => {
  const intl = useIntl();
  const installChoices: { text: string; mode: PluginInstallWay; icon: Icons }[] = [
    {
      text: intl.formatMessage({ defaultMessage: "Zip file from PC" }),
      mode: "install-zip",
      icon: "uploadZipPlugin",
    },
    {
      text: intl.formatMessage({ defaultMessage: "Public GitHub repository" }),
      mode: "install-public-repo",
      icon: "publicGitHubRepo",
    },
    // {
    //   text: intl.formatMessage({ defaultMessage: "Private GitHub repository" }),
    //   mode: "install-private-repo",
    //   icon: "privateGitHubRepo",
    // },
  ];

  return (
    <div className={className}>
      {/* <SectionTitle>
        <StyledFlex align="center" onClick={onMovePrevPage}>
          <Icon icon="arrowLongLeft" size={20} color={theme.colors.text.main} />
          <Box mh="m">
            <Text weight="bold" size="m">
              {intl.formatMessage({ defaultMessage: "Plugins lists" })}
            </Text>
          </Box>
        </StyledFlex>
      </SectionTitle> */}
      <Box p="2xl">
        <Flex gap={28}>
          {installChoices.map(c => {
            return c.mode === "install-public-repo" ? (
              <PublicRepo icon={c.icon} text={c.text} onSend={() => console.log("send")} />
            ) : c.mode === "install-zip" ? (
              <ZipUpload />
            ) : null;
            // <PluginInstallCardButton
            //   key={p.mode}
            //   icon={p.icon}
            //   text={p.text}
            //   onClick={() => onMovePage?.(p.mode)}
            // />
          })}
        </Flex>
      </Box>
      <SectionTitle>
        <Box mh="m">
          <Text weight="bold" size="m">
            {intl.formatMessage({ defaultMessage: "Installed plugins" })}
          </Text>
        </Box>
      </SectionTitle>
      <PluginAccordion items={installedPlugins} />
    </div>
  );
};

const SectionTitle = styled.div`
  border-bottom: ${props => `solid 1px ${props.theme.colors.outline.weak}`};
  padding-bottom: ${props => props.theme.metrics.xl}px;
`;

export default PluginInstall;
