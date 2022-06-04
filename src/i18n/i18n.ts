import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import ja from "./translations/ja.yml";

const resources = {
  en: {
    /**
     * Use key as translation in English.
     * i18next fallback to display key when specified key is empty.
     */
    translation: {},
  },
  ja: {
    translation: ja,
  },
};

export const availableLanguages = Object.keys(resources);

// eslint-disable-next-line import/no-named-as-default-member
i18n.use(LanguageDetector).use(initReactI18next).init({
  resources,
  fallbackLng: "en",

  // allow keys to be phrases having `:`, `.`
  nsSeparator: false,
  keySeparator: false,

  returnEmptyString: false,
});

export default i18n;
