import React from "react";
import Modal from "@reearth/components/atoms/Modal";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Props {}

const AssetDeleteModal: React.FC<Props> = () => {
  return <Modal title="assets delete ?" isVisible={true} size="sm"></Modal>;
};

export default AssetDeleteModal;
