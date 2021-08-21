import React, { useState } from "react";
import { ThemeProvider } from "@emotion/react";
import useHooks from "./hooks";

import GlobalStyle from "./globalstyle";
import { SceneThemeUpdateContext } from "./styled";
import { useThemeQuery } from "@reearth/gql";
import { useAuth } from "@reearth/auth";

const Provider: React.FC = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { data } = useThemeQuery({ skip: !isAuthenticated });
  const [seneThemeOptions, setSceneThemeOptions] = useState<any>(undefined);
  const { theme } = useHooks(seneThemeOptions, data);

  return (
    <ThemeProvider theme={theme}>
      <SceneThemeUpdateContext.Provider value={setSceneThemeOptions}>
        <GlobalStyle />
        {children}
      </SceneThemeUpdateContext.Provider>
    </ThemeProvider>
  );
};

export default Provider;
