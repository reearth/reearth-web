import React from "react";

import LoginMolecule from "@reearth/components/molecules/Authentication/Login";

export type Props = {
  handleLogin: (username: string, password: string) => void;
};

const Login: React.FC<Props> = ({ handleLogin }) => {
  return <LoginMolecule handleLogin={handleLogin} />;
};

export default Login;
