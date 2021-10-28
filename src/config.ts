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

export function convertPasswordPolicy(passwordPolicy: Config["passwordPolicy"]) {
  if (!passwordPolicy) return;
  return Object.fromEntries(
    Object.entries(passwordPolicy)
      .map(([k, v]) => {
        if (typeof v !== "string") return [k, undefined];
        try {
          return [k, new RegExp(v)];
        } catch {
          return [k, undefined];
        }
      })
      .filter(Boolean),
  );
}

export default async function loadConfig() {
  if (window.REEARTH_CONFIG) return;
  window.REEARTH_CONFIG = defaultConfig;
  window.REEARTH_CONFIG = {
    ...defaultConfig,
    ...(await (await fetch("/reearth_config.json")).json()),
  };

  if (!window.REEARTH_CONFIG?.passwordPolicy) return;

  window.REEARTH_CONFIG.passwordPolicy = convertPasswordPolicy(
    window.REEARTH_CONFIG.passwordPolicy,
  );
}
