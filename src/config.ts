export type Config = {
  version?: string;
  api: string;
  plugins: string;
  published: string;
  auth0ClientId?: string;
  auth0Domain?: string;
  auth0Audience?: string;
  googleApiKey?: string;
  googleClientId?: string;
  sentryDsn?: string;
  sentryEnv?: string;
  passwordPolicy?: {
    tooShort?: RegExp | string;
    tooLong?: RegExp | string;
    whitespace?: RegExp | string;
    lowSecurity?: RegExp | string;
    medSecurity?: RegExp | string;
    highSecurity?: RegExp | string;
  };
};
declare global {
  interface Window {
    REEARTH_CONFIG?: Config;
  }
}

export const defaultConfig: Config = {
  api: "/api",
  plugins: "/plugins",
  published: window.origin + "/p/{}/",
};

export default async function loadConfig() {
  if (window.REEARTH_CONFIG) return;
  window.REEARTH_CONFIG = defaultConfig;
  window.REEARTH_CONFIG = {
    ...defaultConfig,
    ...(await (await fetch("/reearth_config.json")).json()),
  };

  if (!window.REEARTH_CONFIG?.passwordPolicy) return;
  try {
    Object.values(window.REEARTH_CONFIG.passwordPolicy).forEach(value => new RegExp(value));
  } catch {
    window.REEARTH_CONFIG.passwordPolicy = undefined;
  }
}
