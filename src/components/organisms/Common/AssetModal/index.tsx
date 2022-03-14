import React from "react";

import MoleculeAssetModal from "@reearth/components/molecules/Common/AssetModal";

import AssetContainer from "./AssetContainer";

export interface Props {
  teamId?: string;
  initialAssetUrl?: string | null;
  openAssets?: boolean;
  toggleAssetModal?: (b: boolean) => void;
  onSelect?: (asset: string | null) => void;
  fileType?: "image" | "video";
}

const AssetModal: React.FC<Props> = ({
  teamId,
  initialAssetUrl,
  openAssets,
  toggleAssetModal,
  onSelect,
  fileType = "image",
}) => {
  return (
    <MoleculeAssetModal
      teamId={teamId}
      initialAssetUrl={initialAssetUrl}
      fileType={fileType}
      isOpen={openAssets}
      toggleAssetModal={toggleAssetModal}
      onSelect={onSelect}
      assetContainer={AssetContainer}
    />
  );
};

export default AssetModal;
