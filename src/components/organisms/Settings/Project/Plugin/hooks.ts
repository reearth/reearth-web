import { useCallback, useMemo } from "react";

import { useLocalState } from "@reearth/state";
import { PluginItem } from "@reearth/components/molecules/Settings/Project/Plugin/PluginSection";
import {
  useInstallablePluginsQuery,
  useInstalledPluginsQuery,
} from "@reearth/gql/graphql-client-api";

export default (projectId: string) => {
  const [{ currentTeam, currentProject }] = useLocalState(s => ({
    currentTeam: s.currentTeam,
    currentProject: s.currentProject,
  }));

  const { loading: pluginLoading } = useInstallablePluginsQuery();

  const { data: rawSceneData, loading: sceneLoading } = useInstalledPluginsQuery({
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
      if (currentTeam && currentProject) {
        await Promise.all(Array.from(files).map(f => console.log(f)));
        await new Promise(() => {});
      }
    },
    [currentProject, currentTeam],
  );

  const installFromPublicRepo = useCallback(
    async (repoUrl: string) => {
      if (currentTeam && currentProject && repoUrl) {
        return new Promise(() => {});
      }
    },
    [currentProject, currentTeam],
  );

  const loading = sceneLoading || pluginLoading;
  return {
    currentTeam,
    currentProject,
    loading,
    installedPlugins,
    installByUploadingZipFile,
    installFromPublicRepo,
  };
};
