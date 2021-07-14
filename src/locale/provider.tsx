import React, { PropsWithChildren } from "react";
import { IntlProvider } from "react-intl";

import { useUserData } from "@reearth/gql";
import { locales, defaultLocale, messages } from "./locale";

export default function Provider({ children }: PropsWithChildren<{}>) {
  const { lang } = useUserData() ?? {};
  const actualLang = lang && locales.includes(lang as any) ? lang : defaultLocale;

  return (
    <IntlProvider locale={actualLang} defaultLocale={defaultLocale} messages={messages[actualLang]}>
      {children}
    </IntlProvider>
  );
}
