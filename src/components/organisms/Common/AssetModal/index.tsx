import React from "react";

import MoleculeAssetModal from "@reearth/components/molecules/Common/AssetModal";

import AssetContainer from "./AssetContainer";

export interface Props {
  teamId?: string;
  initialAssetUrl?: string | null;
  openAssets?: boolean;
  setOpenAssets?: (b: boolean) => void;
  onSelect?: (asset: string | null) => void;
  fileType?: "image" | "video";
}

const AssetModal: React.FC<Props> = ({
  teamId,
  initialAssetUrl,
  openAssets,
  setOpenAssets,
  onSelect,
  fileType = "image",
}) => {
  return (
    <MoleculeAssetModal
      teamId={teamId}
      initialAssetUrl={initialAssetUrl}
      isOpen={openAssets}
      fileType={fileType}
      onOpenModal={setOpenAssets}
      onSelect={onSelect}
      assetContainer={AssetContainer}
    />
  );
};

export default AssetModal;
