import React, { createContext, useContext, PropsWithChildren, useMemo } from "react";
import { useAuth } from "@reearth/auth";
import { useUserDataQuery } from "./graphql-client-api";

export type UserData = {
  lang?: string;
  theme?: string;
};

const Context = createContext<UserData | undefined>(undefined);

export const useUserData = () => useContext(Context);

export default function UserData({ children }: PropsWithChildren<{}>): JSX.Element | null {
  const { isAuthenticated } = useAuth();
  const { data } = useUserDataQuery({ skip: !isAuthenticated });
  const value = useMemo<UserData>(
    () => ({
      theme: data?.me?.theme.toLowerCase(),
      lang: data?.me?.lang,
    }),
    [data],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}
