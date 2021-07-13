export type Config = {
  version: string;
  api: string;
  published: string;
  auth0ClientId?: string;
  auth0Domain?: string;
  auth0Audience?: string;
  googleApiKey?: string;
  googleClientId?: string;
  sentryDsn?: string;
  sentryEnv?: string;
};

declare global {
  interface Window {
    REEARTH_CONFIG?: Config;
  }
  const REEARTH_WEB_VERSION: string | undefined;
}

export const defaultConfig: Config = {
  version: REEARTH_WEB_VERSION || "",
  api: "/api",
  published: location.origin + "/p/{}",
};

export default async function loadConfig() {
  if (window.REEARTH_CONFIG) return;
  window.REEARTH_CONFIG = defaultConfig;
  window.REEARTH_CONFIG = {
    ...defaultConfig,
    ...(await (await fetch("/reearth_config.json")).json()),
    version: defaultConfig.version, // prevent overwriting
  };
}
