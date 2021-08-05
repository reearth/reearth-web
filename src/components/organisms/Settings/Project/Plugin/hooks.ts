import { useCallback, useMemo } from "react";

import { useLocalState } from "@reearth/state";
import { PluginItem } from "@reearth/components/molecules/Settings/Project/Plugin/PluginSection";
import {
  useInstallablePluginsQuery,
  useInstalledPluginsQuery,
  useUninstallPluginMutation,
  useUploadPluginMutation,
} from "@reearth/gql/graphql-client-api";

export default (projectId: string) => {
  const [{ currentTeam, currentProject }] = useLocalState(s => ({
    currentTeam: s.currentTeam,
    currentProject: s.currentProject,
  }));

  const { loading: pluginLoading } = useInstallablePluginsQuery();
  const [uploadPluginMutation] = useUploadPluginMutation();
  const [uninstallPluginMutation] = useUninstallPluginMutation();

  const {
    data: rawSceneData,
    loading: sceneLoading,
    refetch: refetchInstalledPlugins,
  } = useInstalledPluginsQuery({
    variables: { projectId: projectId ?? "" },
    skip: !projectId,
  });

  // const installedPluginIds = useMemo(() => {
  //   return rawSceneData?.scene?.plugins.map(p => p.plugin?.id);
  // }, [rawSceneData?.scene?.plugins]);
  const installedPlugins = useMemo(() => {
    return rawSceneData
      ? rawSceneData?.scene?.plugins.map<PluginItem>(p => ({
          title: p.plugin?.name ?? "",
          bodyMarkdown: p.plugin?.description ?? "",
          author: p.plugin?.author ?? "",
          // thumbnailUrl: p.plugin?.thumbnailUrl,
          isInstalled: true,
          pluginId: p.plugin?.id ?? "",
        }))
      : [];
  }, [rawSceneData]);

  // const plugins = useMemo((): PluginItem[] => {
  //   return rawPluginsData
  //     ? rawPluginsData?.installablePlugins.map<PluginItem>(p => ({
  //         title: p.name,
  //         bodyMarkdown: p.description,
  //         author: p.author,
  //         thumbnailUrl: p.thumbnailUrl,
  //         isInstalled: !!installedPluginIds?.includes(p.name), //TODO: After back-end decide how to generate plugin's id, fix here.
  //       }))
  //     : [];
  // }, [installedPluginIds, rawPluginsData]);

  const installByUploadingZipFile = useCallback(
    async (files: FileList) => {
      const sceneId = rawSceneData?.scene?.id;
      if (!sceneId) return;
      await Promise.all(
        Array.from(files).map(f =>
          uploadPluginMutation({
            variables: { sceneId: sceneId, file: f },
          }),
        ),
      );
      await refetchInstalledPlugins();
    },
    [rawSceneData?.scene?.id, refetchInstalledPlugins, uploadPluginMutation],
  );

  const installFromPublicRepo = useCallback(
    async (repoUrl: string) => {
      const sceneId = rawSceneData?.scene?.id;
      if (!sceneId) return;
      await uploadPluginMutation({
        variables: { sceneId: sceneId, url: repoUrl },
      });
      await refetchInstalledPlugins();
    },
    [rawSceneData?.scene?.id, refetchInstalledPlugins, uploadPluginMutation],
  );

  const uninstallPlugin = useCallback(
    async (pluginId: string) => {
      const sceneId = rawSceneData?.scene?.id;
      if (!sceneId) return;
      await uninstallPluginMutation({ variables: { sceneId: sceneId, pluginId: pluginId } });
      await refetchInstalledPlugins();
    },
    [rawSceneData?.scene?.id, refetchInstalledPlugins, uninstallPluginMutation],
  );

  const loading = sceneLoading || pluginLoading;
  return {
    currentTeam,
    currentProject,
    loading,
    installedPlugins,
    installByUploadingZipFile,
    installFromPublicRepo,
    uninstallPlugin,
  };
};
