import React from "react";

import MoleculeAssetModal from "@reearth/components/molecules/Common/AssetModal";

import useHooks from "./hooks";

export interface Props {
  teamId?: string;
  openAssets?: boolean;
  setOpenAssets?: (b: boolean) => void;
  createAssets?: (files: FileList) => Promise<void>;
  onSelect?: (asset: string | null) => void;
}

const AssetModal: React.FC<Props> = ({ teamId, openAssets, setOpenAssets, onSelect }) => {
  const {
    assets,
    isLoading,
    hasMoreAssets,
    sort,
    searchTerm,
    getMoreAssets,
    createAssets,
    handleSortChange,
    handleSearchTerm,
  } = useHooks(teamId);

  return (
    <MoleculeAssetModal
      isOpen={openAssets}
      assets={assets}
      isLoading={isLoading}
      hasMoreAssets={hasMoreAssets}
      sort={sort}
      searchTerm={searchTerm}
      fileType="image"
      smallCardOnly
      onClose={() => setOpenAssets?.(false)}
      onSelect={onSelect}
      onGetMoreAssets={getMoreAssets}
      onCreateAssets={createAssets}
      onSortChange={handleSortChange}
      onSearch={handleSearchTerm}
    />
  );
};

export default AssetModal;
