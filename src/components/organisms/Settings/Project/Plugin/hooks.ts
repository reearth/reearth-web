import { useApolloClient } from "@apollo/client";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "@reearth/auth";
import { PluginItem } from "@reearth/components/molecules/Settings/Project/Plugin/PluginSection";
import {
  useGetInstallablePluginsQuery,
  useGetInstalledPluginsQuery,
  useUninstallPluginMutation,
  useUploadPluginMutation,
} from "@reearth/gql/graphql-client-api";
import { useLang, useT } from "@reearth/i18n";
import { useTeam, useProject, useNotification } from "@reearth/state";

export default (projectId: string) => {
  const t = useT();
  const locale = useLang();
  const client = useApolloClient();
  const [currentTeam] = useTeam();
  const [currentProject] = useProject();
  const [, setNotification] = useNotification();
  const { getAccessToken } = useAuth();
  const [accessToken, setAccessToken] = useState<string>();

  useEffect(() => {
    getAccessToken().then(token => {
      setAccessToken(token);
    });
  }, [getAccessToken]);

  const { loading: pluginLoading } = useGetInstallablePluginsQuery();
  const [uploadPluginMutation] = useUploadPluginMutation();
  const [uninstallPluginMutation] = useUninstallPluginMutation();

  const extensions = accessToken
    ? {
        library: window.REEARTH_CONFIG?.extensions?.pluginLibrary,
        installed: window.REEARTH_CONFIG?.extensions?.pluginInstalled,
      }
    : undefined;

  const {
    data: rawSceneData,
    loading: sceneLoading,
    // refetch: refetchInstalledPlugins,
  } = useGetInstalledPluginsQuery({
    variables: { projectId: projectId ?? "", lang: locale },
    skip: !projectId,
  });

  const installedPlugins = useMemo(() => {
    return rawSceneData
      ? rawSceneData?.scene?.plugins
          .filter(p => p.plugin?.id !== "reearth")
          .map<PluginItem>(p => ({
            title: p.plugin?.translatedName ?? "",
            bodyMarkdown: p.plugin?.translatedDescription ?? "",
            author: p.plugin?.author ?? "",
            // thumbnailUrl: p.plugin?.thumbnailUrl,
            isInstalled: true,
            pluginId: p.plugin?.id ?? "",
          }))
      : [];
  }, [rawSceneData]);

  const installByUploadingZipFile = useCallback(
    async (files: FileList) => {
      const sceneId = rawSceneData?.scene?.id;
      if (!sceneId) return;
      const results = await Promise.all(
        Array.from(files).map(f =>
          uploadPluginMutation({
            variables: { sceneId: sceneId, file: f },
          }),
        ),
      );
      if (!results || results.some(r => r.errors)) {
        await client.resetStore();
        setNotification({
          type: "error",
          text: t("Failed to install plugin."),
        });
      } else {
        setNotification({
          type: "success",
          text: t("Successfully installed plugin!"),
        });
        // await refetchInstalledPlugins();
        client.resetStore();
      }
    },
    [rawSceneData?.scene?.id, uploadPluginMutation, setNotification, t, client],
  );

  const installFromPublicRepo = useCallback(
    async (repoUrl: string) => {
      const sceneId = rawSceneData?.scene?.id;
      if (!sceneId) return;
      const results = await uploadPluginMutation({
        variables: { sceneId: sceneId, url: repoUrl },
      });
      if (results.errors || !results.data?.uploadPlugin) {
        setNotification({
          type: "error",
          text: t("Failed to install plugin."),
        });
      } else {
        setNotification({
          type: "success",
          text: t("Successfully installed plugin!"),
        });
        // await refetchInstalledPlugins();
        await client.resetStore();
      }
    },
    [rawSceneData?.scene?.id, uploadPluginMutation, setNotification, t, client],
  );

  const uninstallPlugin = useCallback(
    async (pluginId: string) => {
      const sceneId = rawSceneData?.scene?.id;
      if (!sceneId) return;
      const results = await uninstallPluginMutation({
        variables: { sceneId: sceneId, pluginId: pluginId },
      });
      if (results.errors || !results.data?.uninstallPlugin) {
        setNotification({
          type: "error",
          text: t("Failed to uninstall plugin."),
        });
      } else {
        setNotification({
          type: "info",
          text: t("Successfully removed plugin."),
        });
        await client.resetStore();
        // await refetchInstalledPlugins();
      }
    },
    [rawSceneData?.scene?.id, uninstallPluginMutation, setNotification, t, client],
  );

  const loading = sceneLoading || pluginLoading;
  return {
    currentTeam,
    currentProject,
    loading,
    installedPlugins,
    extensions,
    accessToken,
    installByUploadingZipFile,
    installFromPublicRepo,
    uninstallPlugin,
  };
};
