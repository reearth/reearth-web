import React from "react";

import PasswordResetMolecule, {
  PasswordPolicy,
} from "@reearth/components/molecules/Authentication/PasswordReset";

export type Props = {
  onPasswordReset: (username: string, password: string) => void;
  passwordPolicy?: PasswordPolicy;
};

const PasswordReset: React.FC<Props> = ({ onPasswordReset, passwordPolicy }) => {
  return (
    <PasswordResetMolecule onPasswordReset={onPasswordReset} passwordPolicy={passwordPolicy} />
  );
};

export default PasswordReset;
