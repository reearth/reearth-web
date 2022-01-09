import React from "react";

import NewPasswordMolecule, {
  PasswordPolicy,
} from "@reearth/components/molecules/Authentication/PasswordReset/newPassword";

export type Props = {
  onNewPasswordSubmit: (email: string) => void;
  passwordPolicy?: PasswordPolicy;
};

const NewPassword: React.FC<Props> = ({ onNewPasswordSubmit, passwordPolicy }) => {
  return (
    <NewPasswordMolecule
      onNewPasswordSubmit={onNewPasswordSubmit}
      passwordPolicy={passwordPolicy}
    />
  );
};

export default NewPassword;
