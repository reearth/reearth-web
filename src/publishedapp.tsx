import React from "react";

import { Provider as ThemeProvider } from "./theme";
import { Provider as LocalStateProvider } from "./state";
import { Provider as IntlProvider } from "./locale";
import { Provider as DndProvider } from "./util/use-dnd";

import PublishedPage from "@reearth/components/pages/Published";

export default function App() {
  return (
    <ThemeProvider>
      <LocalStateProvider>
        <DndProvider>
          <IntlProvider>
            <PublishedPage />
          </IntlProvider>
        </DndProvider>
      </LocalStateProvider>
    </ThemeProvider>
  );
}
