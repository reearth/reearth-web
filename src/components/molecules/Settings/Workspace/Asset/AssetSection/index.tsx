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
  assets: AssetType[];
  isLoading: boolean;
  hasMoreAssets: boolean | undefined;
  sort?: { type?: AssetSortType | null; reverse?: boolean };
  searchTerm?: string;
  onGetMoreAssets: () => void;
  onCreateAssets: (files: FileList) => Promise<void>;
  onRemoveAssets: (assetIds: string[]) => Promise<void>;
  onSortChange: (type?: string, reverse?: boolean) => void;
  onSearch: (term?: string) => void;
};

const AssetSection: React.FC<Props> = ({
  assets,
  isLoading,
  hasMoreAssets,
  sort,
  searchTerm,
  onGetMoreAssets,
  onCreateAssets,
  onSortChange,
  onSearch,
  onRemoveAssets,
}) => {
  const [selectedAssets, selectAsset] = useState<Asset[]>([]);

  return (
    <AssetContainer
      assets={assets}
      sort={sort}
      searchTerm={searchTerm}
      selectedAssets={selectedAssets}
      isMultipleSelectable
      height={700}
      hasMoreAssets={hasMoreAssets}
      isLoading={isLoading}
      onCreateAsset={onCreateAssets}
      onRemove={onRemoveAssets}
      onSortChange={onSortChange}
      onSearch={onSearch}
      selectAsset={selectAsset}
      onGetMore={onGetMoreAssets}
    />
  );
};

export default AssetSection;
