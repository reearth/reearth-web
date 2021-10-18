import React from "react";

import SignUp from "@reearth/components/organisms/Authentication/SignUp";

export type Props = {
  path?: string;
};

const SignUpPage: React.FC<Props> = () => {
  return <SignUp />;
};

export default SignUpPage;
