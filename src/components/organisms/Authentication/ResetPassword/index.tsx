import React from "react";

import ResetPasswordMolecule from "@reearth/components/molecules/Authentication/ResetPassword";

export type Props = {
  resetPassword?: () => void;
};

const ResetPassword: React.FC<Props> = () => {
  return <ResetPasswordMolecule />;
};

export default ResetPassword;
