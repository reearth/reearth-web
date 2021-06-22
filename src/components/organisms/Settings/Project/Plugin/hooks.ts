import { useLocalState } from "@reearth/state";
import { useInstallablePluginsQuery } from "@reearth/gql";
import { useMemo } from "react";
import { PluginItem } from "@reearth/components/molecules/Settings/Workspace/Plugin/PluginSection";

export default () => {
  const [{ currentTeam, currentProject }] = useLocalState(s => ({
    currentTeam: s.currentTeam,
    currentProject: s.currentProject,
  }));

  const { data: rawPlugins, loading } = useInstallablePluginsQuery();

  const plugins = useMemo((): PluginItem[] => {
    return rawPlugins
      ? rawPlugins?.installablePlugins.map<PluginItem>(p => ({
          title: p.name,
          bodyMarkdown: p.description,
          author: p.author,
          thumbnailUrl: p.thumbnailUrl,
          isInstalled: false,
        }))
      : [];
  }, [rawPlugins]);

  console.log("plugin----------", plugins);
  return { currentTeam, currentProject, plugins, loading };
};
