import React from "react";

import PasswordResetMolecule from "@reearth/components/molecules/Authentication/PasswordReset";

export type Props = {
  onPasswordResetRequest: (email?: string) => any;
};

const PasswordReset: React.FC<Props> = ({ onPasswordResetRequest }) => {
  return <PasswordResetMolecule onPasswordResetRequest={onPasswordResetRequest} />;
};

export default PasswordReset;
