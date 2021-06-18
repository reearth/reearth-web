import { useLocalState } from "@reearth/state";
import { useInstallablePluginsQuery } from "@reearth/gql";
import { useMemo } from "react";

export default () => {
  const [{ currentTeam, currentProject }] = useLocalState(s => ({
    currentTeam: s.currentTeam,
    currentProject: s.currentProject,
  }));

  const { data: rawPlugins, loading } = useInstallablePluginsQuery();

  const plugins = useMemo(() => {
    return rawPlugins?.installablePlugins.map(p => ({
      title: p.name,
      bodyMarkdown: p.description,
    }));
  }, [rawPlugins?.installablePlugins]);
  //DELETE_ME: When plugin API is ready
  // const samplePlugins = [
  //   {
  //     id: "hogehoge",
  //     thumbnail: "https://static.dev.reearth.io/assets/01ep431qsvnjndxhan3gwqd1rj.png",
  //     title: "Storytelling",
  //     isInstalled: true,
  //     bodyMarkdown: "# Hoge\n## Fuag",
  //   },
  //   {
  //     id: "fugafuga",
  //     thumbnail: "https://static.dev.reearth.io/assets/01ep431qsvnjndxhan3gwqd1rj.png",
  //     title: "Storytelling",
  //     isInstalled: false,
  //     bodyMarkdown: "# Hoge\n## Fuag",
  //   },
  // ];

  return { currentTeam, currentProject, plugins: plugins, loading };
};
