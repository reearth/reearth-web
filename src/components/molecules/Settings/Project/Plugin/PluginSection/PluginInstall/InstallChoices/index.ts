import ZipUpload from "../ZipUpload";
import { PluginInstallWay } from "@reearth/components/molecules/Settings/Project/Plugin/PluginSection";
import React from "react";
import PublicRepo from "../PublicRepo";
import PrivateRepo from "../PrivateRepo";

const installChoices: { [k in PluginInstallWay]: React.ReactNode } = {
  "install-zip": ZipUpload,
  "install-public-repo": PublicRepo,
  "install-private-repo": PrivateRepo,
};

export const pluginInstallWays = (type: PluginInstallWay) => {
  return installChoices[type];
};
