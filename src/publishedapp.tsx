import React from "react";

import PublishedPage from "@reearth/components/pages/Published";

import { Provider as I18nProvider } from "./i18n";
import { PublishedProvider as LegacyIntlProvider } from "./i18n/legacy";
import { PublishedAppProvider as ThemeProvider } from "./theme";
import { Provider as DndProvider } from "./util/use-dnd";

export default function App() {
  return (
    <ThemeProvider>
      <DndProvider>
        <I18nProvider>
          <LegacyIntlProvider>
            <PublishedPage />
          </LegacyIntlProvider>
        </I18nProvider>
      </DndProvider>
    </ThemeProvider>
  );
}
