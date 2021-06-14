import React, { useState } from "react";
import AssetContainer from "@reearth/components/molecules/Common/AssetModal/AssetContainer";

type Asset = {
  id: string;
  teamId: string;
  name: string;
  size: number;
  url: string;
  contentType: string;
};

type Props = {
  assets?: Asset[];
  onCreate?: (file: File) => void;
  onRemove?: (id: string) => void;
};

const AssetSection: React.FC<Props> = ({ assets = [], onCreate, onRemove }) => {
  const [selectedAssets, selectAsset] = useState<Asset[]>([]);

  return (
    <AssetContainer
      assets={assets}
      onCreateAsset={onCreate}
      onRemove={onRemove}
      selectedAssets={selectedAssets}
      selectAsset={selectAsset}
      isSettingPage={true}
    />
  );
};

export default AssetSection;
