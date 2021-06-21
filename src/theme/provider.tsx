import React from "react";
import { ThemeProvider } from "@emotion/react";

import darkTheme from "./darkTheme";
import lightTheme from "./lightTheme";
import GlobalStyle from "./globalstyle";
import { Theme, useThemeQuery } from "@reearth/gql";
import { useAuth } from "@reearth/auth";

const Provider: React.FC = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { data } = useThemeQuery({ skip: !isAuthenticated });

  const theme = data?.me?.theme === ("dark" as Theme) ? darkTheme : lightTheme;
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      {children}
    </ThemeProvider>
  );
};

export default Provider;
