import React, { PropsWithChildren } from "react";
import { ThemeProvider } from "@emotion/react";

import { useUserData } from "@reearth/gql";

import type { Theme } from "./theme";
import dark from "./darkTheme";
import light from "./lightTheme";
import GlobalStyle from "./globalstyle";

const defaultTheme: Theme = dark;
const themes: Record<string, Theme> = {
  light,
  dark,
};

export default function Provider({ children }: PropsWithChildren<{}>) {
  const { theme } = useUserData() ?? {};

  return (
    <ThemeProvider theme={theme ? themes[theme] ?? defaultTheme : defaultTheme}>
      <GlobalStyle />
      {children}
    </ThemeProvider>
  );
}
