import React from "react";

import MoleculeAssetsContainer from "@reearth/components/molecules/Common/AssetModal/AssetsContainer";

import useHooks, { Asset as AssetType } from "./hooks";

export type Asset = AssetType;

type Props = {
  teamId: string;
  allowedAssetType?: "image" | "video" | "file";
  initialAsset?: { id?: string; url: string };
  isMultipleSelectable?: boolean;
  creationEnabled?: boolean;
  deletionEnabled?: boolean;
  height?: number;
};

const AssetsContainer: React.FC<Props> = ({
  teamId,
  allowedAssetType,
  initialAsset,
  isMultipleSelectable,
  creationEnabled,
  deletionEnabled,
  height,
}) => {
  const { assets, selectedAssets, selectAsset, createAssets, removeAsset } = useHooks({
    teamId,
    allowedAssetType,
    initialAsset,
    isMultipleSelectable,
    creationEnabled,
    deletionEnabled,
  });
  return (
    <MoleculeAssetsContainer
      assets={assets}
      accept={allowedAssetType}
      selectedAssets={selectedAssets}
      selectAsset={selectAsset}
      onCreateAsset={createAssets}
      onRemove={removeAsset}
      height={height}
    />
  );
};

export default AssetsContainer;
