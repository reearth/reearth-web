import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";

import Box from "@reearth/components/atoms/Box";
import Loading from "@reearth/components/atoms/Loading";
import TabSection from "@reearth/components/atoms/TabSection";
import { PluginItem as PluginItemType } from "@reearth/components/molecules/Settings/Project/Plugin/PluginAccordion";
import { Extension } from "@reearth/config";
import { useT } from "@reearth/i18n";

import PluginInstall from "./PluginInstall";

export type PluginItem = PluginItemType;

export type Props = {
  title?: string;
  plugins?: PluginItem[];
  loading?: boolean;
  installedPlugins?: PluginItem[];
  extensions?: {
    library: Extension<"plugin-library">[] | undefined;
    installed: Extension<"plugin-installed">[] | undefined;
  };
  accessToken?: string;
  onInstallByMarketplace: (pluginId: string) => void;
  onInstallFromPublicRepo: (repoUrl: string) => void;
  onInstallByUploadingZipFile: (files: FileList) => void;
  uninstallPlugin: (pluginId: string) => void;
};

export type PluginPageMode = "list" | "install-way" | PluginInstallWay;

export type PluginInstallWay = "install-zip" | "install-public-repo" | "install-private-repo";

export type PluginTabs = "Library" | "Installed" | "Uploaded";

const PluginSection: React.FC<Props> = ({
  loading,
  installedPlugins,
  extensions,
  accessToken,
  onInstallByMarketplace,
  onInstallByUploadingZipFile,
  onInstallFromPublicRepo,
  uninstallPlugin,
}) => {
  const t = useT();
  const { search } = useLocation();
  const queriedPluginId = useMemo(
    () => new URLSearchParams(search).get("pluginId") ?? undefined,
    [search],
  );

  const tabHeaders = useMemo(
    () => ({
      Library: t("Plugin Library"),
      Installed: t("Installed"),
      Uploaded: t("Uploaded Plugins"),
    }),
    [t],
  );

  return (
    <>
      <TabSection<PluginTabs> selected="Library" menuAlignment="top" headers={tabHeaders}>
        {{
          Library: (
            <Box p="2xl">
              {accessToken &&
                extensions?.library?.map(ext => (
                  <ext.component
                    key={ext.id}
                    pluginId={queriedPluginId}
                    accessToken={accessToken}
                    onInstall={onInstallByMarketplace}
                    onUninstall={uninstallPlugin}
                  />
                ))}
            </Box>
          ),
          Installed: (
            <Box p="2xl">
              {accessToken &&
                extensions?.installed?.map(ext => (
                  <ext.component
                    key={ext.id}
                    pluginId={queriedPluginId}
                    accessToken={accessToken}
                    onInstall={onInstallByMarketplace}
                    onUninstall={uninstallPlugin}
                  />
                ))}
            </Box>
          ),
          Uploaded: loading ? (
            <Loading />
          ) : (
            <PluginInstall
              installedPlugins={installedPlugins}
              installFromPublicRepo={onInstallFromPublicRepo}
              installByUploadingZipFile={onInstallByUploadingZipFile}
              uninstallPlugin={uninstallPlugin}
            />
          ),
        }}
      </TabSection>
    </>
  );
};

export default PluginSection;
