import React from "react";

// import { styled, useTheme } from "@reearth/theme";
import Loading from "@reearth/components/atoms/Loading";
// import Text from "@reearth/components/atoms/Text";
// import { useIntl } from "react-intl";
import { PluginItem as PluginItemType } from "./PluginList";
import PluginInstall from "./PluginInstall";
// import PluginList from "./PluginList";
// import PluginInstall from "./PluginInstall";

export type PluginItem = PluginItemType;

export type Props = {
  title?: string;
  plugins?: PluginItem[];
  loading?: boolean;
  installedPlugins?: PluginItem[];
};

export type PluginPageMode = "list" | "install-way" | PluginInstallWay;

export type PluginInstallWay = "install-zip" | "install-public-repo" | "install-private-repo";

const PluginSection: React.FC<Props> = ({ loading, installedPlugins }) => {
  // const [pageMode, setPageMode] = useState<PluginPageMode>("install-way");
  // const handleMovePageMode = (mode: PluginPageMode) => {
  //   setPageMode(mode);
  // };

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <PluginInstall
          //  onMovePage={handleMovePageMode}
          installedPlugins={installedPlugins}
        />
      )}
    </>
  );
};

export default PluginSection;
