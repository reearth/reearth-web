import React from "react";

import ResetPassword from "@reearth/components/organisms/Authentication/ResetPassword";

export type Props = {
  path?: string;
};

const ResetPasswordPage: React.FC<Props> = () => {
  return <ResetPassword />;
};

export default ResetPasswordPage;
