import React from "react";

import PasswordResetMolecule from "@reearth/components/molecules/Authentication/PasswordReset";

export type Props = {
  onPasswordResetRequest: (email: string) => void;
};

const PasswordReset: React.FC<Props> = ({ onPasswordResetRequest }) => {
  return <PasswordResetMolecule onPasswordResetRequest={onPasswordResetRequest} />;
};

export default PasswordReset;
