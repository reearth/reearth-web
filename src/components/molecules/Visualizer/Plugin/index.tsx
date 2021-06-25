import React, { CSSProperties, useCallback, useMemo } from "react";

import P, { IFrameAPI } from "@reearth/components/atoms/Plugin";
import { useEngineAPI } from "../engineApi";

export type Props = {
  className?: string;
  style?: CSSProperties;
  exposed?: any;
  plugin?: string;
  visible?: boolean;
  pluginBaseUrl?: string;
};

const defaultPluginBaseUrl = `${window.REEARTH_CONFIG?.api || "/api"}/plugins`;

export default function Plugin({
  className,
  style,
  exposed,
  plugin,
  visible,
  pluginBaseUrl = defaultPluginBaseUrl,
}: Props): JSX.Element | null {
  const engineApi = useEngineAPI<{}>();

  const e = useMemo(
    () =>
      Object.fromEntries(
        Object.entries({ ...exposed, ...(engineApi ?? {}) }).map(([k, v]) => [`reearth.${k}`, v]),
      ),
    [engineApi, exposed],
  );

  const handleStaticExpose = useCallback(
    (iFrameApi: IFrameAPI) => ({
      console: {
        log: console.log,
        error: console.error,
      },
      reearth: {
        ui: {
          show: iFrameApi.render,
          postMessage: iFrameApi.postMessage,
        },
      },
    }),
    [],
  );

  const handleError = useCallback(
    (err: any) => {
      console.error(`plugin error from ${plugin}: `, err);
    },
    [plugin],
  );

  const src = plugin ? `${pluginBaseUrl}/${plugin.replace(/\.\./g, "")}.js` : undefined;

  return src ? (
    <P
      className={className}
      style={style}
      src={src}
      exposed={e}
      staticExposed={handleStaticExpose}
      onError={handleError}
      onMessageCode="globalThis.reearth.ui.onmessage"
      onUpdateCode="globalThis.reearth.onupdate"
      canBeVisible={visible}
    />
  ) : null;
}
