import React from "react";

import AuthPage from "..";

export type Props = {
  signup?: () => void;
};

const SignUp: React.FC<Props> = () => {
  return (
    <AuthPage>
      <p>signup</p>
    </AuthPage>
  );
};

export default SignUp;
