export type Config = {
  version?: string;
  api: string;
  ext?: React.ComponentType;
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
    tooShort?: RegExp;
    tooLong?: RegExp;
    whitespace?: RegExp;
    lowSecurity?: RegExp;
    medSecurity?: RegExp;
    highSecurity?: RegExp;
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
  auth0Audience: "http://localhost:8080",
  auth0Domain: "http://localhost:8080",
  auth0ClientId: "reearth-authsrv-client-default",
};

export function convertPasswordPolicy(passwordPolicy?: {
  [key: string]: string;
}): { [key: string]: RegExp | undefined } | undefined {
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
      .filter(i => !!i[1]),
  );
}

export default async function loadConfig() {
  if (window.REEARTH_CONFIG) return;
  window.REEARTH_CONFIG = defaultConfig;

  let ext: any;
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    ext = (await import(/* webpackIgnore: true */ "/test.js")).default;
  } catch (e) {
    // ignore
  }

  console.log(ext);

  window.REEARTH_CONFIG = {
    ...defaultConfig,
    ...(await (await fetch("/reearth_config.json")).json()),
    ext,
  };

  if (!window.REEARTH_CONFIG?.passwordPolicy) return;

  window.REEARTH_CONFIG.passwordPolicy = convertPasswordPolicy(
    window.REEARTH_CONFIG.passwordPolicy as { [key: string]: string },
  );
}
