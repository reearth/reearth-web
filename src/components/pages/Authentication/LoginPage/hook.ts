import { useEffect } from "react";

import { useAuth } from "@reearth/auth";

export function useUserTokenRequired(): [boolean, boolean] {
  const { isAuthenticated, isLoading, error: authError, login, logout } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (isLoading || isAuthenticated || params.has("id")) {
      return;
    }
    login();
  }, [authError, isAuthenticated, isLoading, login, logout]);

  return [isAuthenticated, isLoading];
}
