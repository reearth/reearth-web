export type ExtensionType = "dataset-import" | "publication";

export type SharedExtensionProps = {
  theme?: "dark" | "light";
  lang?: "en" | "ja";
  accessToken?: string;
  onNotificationChange?: (
    type: "error" | "warning" | "info" | "success",
    text: string,
    heading?: string,
  ) => void;
};

export type DatasetImportExtensionProps = {
  onReturn?: () => void;
  onUrlChange?: (url: string) => void;
  url?: string;
} & SharedExtensionProps;

export type ProjectPublicationExtensionProps = {
  projectId: string;
  projectAlias?: string;
  publishDisabled?: boolean;
} & SharedExtensionProps;

export type ExtensionProps = {
  "dataset-import": DatasetImportExtensionProps;
  publication: ProjectPublicationExtensionProps;
};

export type Extension<T extends ExtensionType = ExtensionType> = {
  type: T;
  id: string;
  component: React.ComponentType<ExtensionProps[T]>;
  title?: string;
  image?: string;
};

export type Extensions = {
  publication?: Extension<"publication">[];
  datasetImport?: Extension<"dataset-import">[];
};

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
    tooShort?: RegExp;
    tooLong?: RegExp;
    whitespace?: RegExp;
    lowSecurity?: RegExp;
    medSecurity?: RegExp;
    highSecurity?: RegExp;
  };
  ip?: string;
  extensionURLs?: string[];
  extensions?: Extensions;
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
  extensionURLs: ["http://localhost:8887/reearth-cloud.es.js"],
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

export function getExtensionsFrom(urls?: string[]): Extensions | undefined {
  if (!urls) return undefined;
  // Entry point for publication extensions is @reearth/components/molecules/Settings/Project/PublishSection
  const publication: Extension<"publication">[] = [];
  // Entry point for dataset import extensions is @reearth/components/molecules/EarthEditor/DatasetPane/DatasetModal
  const datasetImport: Extension<"dataset-import">[] = [];
  (async () => {
    for (let i = 0; i < urls.length; i++) {
      try {
        const newExtensions: Extension[] = (await import(/* webpackIgnore: true */ urls[i]))
          .default;
        newExtensions.forEach(ext =>
          ext.type === "dataset-import"
            ? datasetImport.push(ext as Extension<"dataset-import">)
            : ext.type === "publication"
            ? publication.push(ext as Extension<"publication">)
            : undefined,
        );
      } catch (e) {
        // ignore
      }
    }
  })();
  return {
    publication,
    datasetImport,
  };
}

export function importExternal(url: string) {
  return new Promise((res, rej) => {
    const script = document.createElement("script");
    script.src = url;
    script.async = true;
    script.onload = () => {
      if (!window.REEARTH_CONFIG) return;
      res(window.REEARTH_CONFIG.extensions);
    };
    script.onerror = rej;

    document.body.appendChild(script);
  });
}

export default async function loadConfig() {
  if (window.REEARTH_CONFIG) return;
  window.REEARTH_CONFIG = defaultConfig;
  window.REEARTH_CONFIG = {
    ...defaultConfig,
    ...(await (await fetch("/reearth_config.json")).json()),
  };

  if (window.REEARTH_CONFIG?.passwordPolicy) {
    window.REEARTH_CONFIG.passwordPolicy = convertPasswordPolicy(
      window.REEARTH_CONFIG.passwordPolicy as { [key: string]: string },
    );
  }

  if (window.REEARTH_CONFIG?.extensionURLs) {
    const urls = window.REEARTH_CONFIG.extensionURLs;
    const extensions = getExtensionsFrom(urls);
    window.REEARTH_CONFIG.extensions = extensions;
  }
}
