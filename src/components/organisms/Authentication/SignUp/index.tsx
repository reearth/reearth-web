import React from "react";

import SignUpMolecule from "@reearth/components/molecules/Authentication/SignUp";

export type Props = {
  signup?: () => void;
};

const SignUp: React.FC<Props> = ({ signup }) => {
  return <SignUpMolecule signup={signup} />;
};

export default SignUp;
