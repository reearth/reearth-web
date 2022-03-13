import React from "react";

import MoleculeAssetContainer, {
  Props as AssetContainerProps,
} from "@reearth/components/molecules/Common/AssetModal/AssetContainer";

export type Props = AssetContainerProps;

const AssetContainer: React.FC<Props> = props => {
  return <MoleculeAssetContainer {...props} />;
};

export default AssetContainer;
