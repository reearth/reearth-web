import React, { useState } from "react";
import { ThemeProvider } from "@emotion/react";
import { SceneThemeUpdateContext } from "./styled";
import useHooks from "./hooks";

import GlobalStyle from "./globalstyle";

const Provider: React.FC = ({ children }) => {
  const [seneThemeOptions, setSceneThemeOptions] = useState<any>(undefined);
  const { theme } = useHooks(seneThemeOptions, null);

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
