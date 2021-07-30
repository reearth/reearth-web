import { useMemo } from "react";

import { useLocalState } from "@reearth/state";
import { useInstallablePluginsQuery, useInstalledPluginsQuery } from "@reearth/gql";
import { PluginItem } from "@reearth/components/molecules/Settings/Project/Plugin/PluginSection";

export default (projectId: string) => {
  const [{ currentTeam, currentProject }] = useLocalState(s => ({
    currentTeam: s.currentTeam,
    currentProject: s.currentProject,
  }));

  const { data: rawPluginsData, loading: pluginLoading } = useInstallablePluginsQuery();

  const { data: rawSceneData, loading: sceneLoading } = useInstalledPluginsQuery({
    variables: { projectId: projectId ?? "" },
    skip: !projectId,
  });

  const installedPluginIds = useMemo(() => {
    return rawSceneData?.scene?.plugins.map(p => p.plugin?.id);
  }, [rawSceneData?.scene?.plugins]);

  const plugins = useMemo((): PluginItem[] => {
    return rawPluginsData
      ? rawPluginsData?.installablePlugins.map<PluginItem>(p => ({
          title: p.name,
          bodyMarkdown: p.description,
          author: p.author,
          thumbnailUrl: p.thumbnailUrl,
          isInstalled: !!installedPluginIds?.includes(p.name), //TODO: After back-end decide how to generate plugin's id, fix here.
        }))
      : [];
  }, [installedPluginIds, rawPluginsData]);

  const loading = sceneLoading || pluginLoading;
  return { currentTeam, currentProject, plugins, loading };
};
