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
  const { assetsData } = useHooks(teamId);

  return (
    <MoleculeAssetModal
      isOpen={openAssets}
      onClose={() => setOpenAssets?.(false)}
      assetsData={assetsData}
      fileType="image"
      onSelect={onSelect}
    />
  );
};

export default AssetModal;
