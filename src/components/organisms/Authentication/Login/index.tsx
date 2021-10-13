import React from "react";

import LoginMolecule from "@reearth/components/molecules/Authentication/Login";

export type Props = {
  login: () => void;
};

const Login: React.FC<Props> = ({ login }) => {
  return <LoginMolecule login={login} />;
};

export default Login;
