import React, { useState } from "react";

import AssetContainer, {
  Asset as AssetType,
  AssetSortTypes as SortTypes,
} from "@reearth/components/molecules/Common/AssetModal/AssetContainer";

export type AssetSortTypes = SortTypes;

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
    sortType?: AssetSortTypes | null;
    handleSortType: (sort?: AssetSortTypes) => void;
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
      sortType={assetsData?.sortType}
      handleSortType={assetsData?.handleSortType}
      searchTerm={assetsData?.searchTerm}
      handleSearchTerm={assetsData?.handleSearchTerm}
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
