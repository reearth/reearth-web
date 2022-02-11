import React, { useState } from "react";

import AssetContainer, {
  Asset as AssetType,
} from "@reearth/components/molecules/Common/AssetModal/AssetContainer";

type Asset = {
  id: string;
  teamId: string;
  name: string;
  size: number;
  url: string;
  contentType: string;
};

type Props = {
  assetsData: {
    assets: AssetType[];
    isLoading: boolean;
    getMoreAssets: () => void;
    createAssets: (files: FileList) => Promise<void>;
    hasNextPage: boolean | undefined;
    removeAsset: (assetIds: string[]) => Promise<void>;
  };
};

const AssetSection: React.FC<Props> = ({ assetsData }) => {
  const [selectedAssets, selectAsset] = useState<Asset[]>([]);

  return (
    <AssetContainer
      assets={assetsData?.assets}
      onCreateAsset={assetsData?.createAssets}
      onRemove={assetsData?.removeAsset}
      selectedAssets={selectedAssets}
      isMultipleSelectable
      selectAsset={selectAsset}
      height={700}
      hasNextPage={assetsData?.hasNextPage}
      isLoading={assetsData?.isLoading}
      onGetMore={assetsData?.getMoreAssets}
    />
  );
};

export default AssetSection;
