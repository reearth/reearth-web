import React, { useState } from "react";

import AssetContainer, {
  Asset as AssetType,
  AssetSortType as SortType,
} from "@reearth/components/molecules/Common/AssetModal/AssetContainer";

export type AssetSortType = SortType;

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
    hasMoreAssets: boolean | undefined;
    removeAsset: (assetIds: string[]) => Promise<void>;
    sort?: { type?: AssetSortType | null; reverse?: boolean };
    handleSortChange: (type?: string, reverse?: boolean) => void;
    searchTerm?: string;
    handleSearchTerm: (term?: string) => void;
  };
};

const AssetSection: React.FC<Props> = ({ assetsData }) => {
  const [selectedAssets, selectAsset] = useState<Asset[]>([]);

  return (
    <AssetContainer
      assets={assetsData?.assets}
      onCreateAsset={assetsData?.createAssets}
      onRemove={assetsData?.removeAsset}
      sort={assetsData?.sort}
      handleSortChange={assetsData?.handleSortChange}
      searchTerm={assetsData?.searchTerm}
      handleSearchTerm={assetsData?.handleSearchTerm}
      selectedAssets={selectedAssets}
      isMultipleSelectable
      selectAsset={selectAsset}
      height={700}
      hasMoreAssets={assetsData?.hasMoreAssets}
      isLoading={assetsData?.isLoading}
      onGetMore={assetsData?.getMoreAssets}
    />
  );
};

export default AssetSection;
