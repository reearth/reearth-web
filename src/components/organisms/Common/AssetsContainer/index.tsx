import React from "react";

import MoleculeAssetsContainer from "@reearth/components/molecules/Common/AssetModal/AssetsContainer";

import useHooks, { Asset as AssetType } from "./hooks";

export type Asset = AssetType;

type Props = {
  teamId: string;
  allowedAssetType?: "image" | "video" | "file";
  isMultipleSelectable?: boolean;
  creationEnabled?: boolean;
  deletionEnabled?: boolean;
  isHeightFixed?: boolean;
};

const AssetsContainer: React.FC<Props> = ({
  teamId,
  allowedAssetType,
  isMultipleSelectable,
  creationEnabled,
  deletionEnabled,
  isHeightFixed,
}) => {
  const { assets, selectedAssets, selectAsset, createAssets, removeAsset } = useHooks({
    teamId,
    allowedAssetType,
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
      isHeightFixed={isHeightFixed}
    />
  );
};

export default AssetsContainer;
