import React from "react";
import { ThemeProvider } from "@emotion/react";

import darkTheme from "./darkTheme";
import lightTheme from "./lightTheme";
import GlobalStyle from "./globalstyle";
import { Theme, useThemeQuery } from "@reearth/gql";

const Provider: React.FC = ({ children }) => {
  const { data } = useThemeQuery();

  const theme = data?.me?.theme === ("light" as Theme) ? lightTheme : darkTheme;
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      {children}
    </ThemeProvider>
  );
};

export default Provider;
