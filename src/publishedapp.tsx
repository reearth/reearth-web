import React from "react";
import { LocationProvider } from "@reach/router";

import { Provider as ThemeProvider } from "./theme";
import { Provider as LocalStateProvider } from "./state";
import { Provider as IntlProvider } from "./locale";

import PublishedPage from "@reearth/components/pages/Published";

export default function App() {
  return (
    <ThemeProvider>
      <LocalStateProvider>
        <LocationProvider>
          <IntlProvider>
            <PublishedPage />
          </IntlProvider>
        </LocationProvider>
      </LocalStateProvider>
    </ThemeProvider>
  );
}
