import { getQuickJS } from "quickjs-emscripten";
import { Arena } from "quickjs-emscripten-sync";
import { useCallback, useEffect, useRef, useState } from "react";

import { IFrameAPI, Ref as IFrameRef } from "./PluginIFrame";

export type Options = {
  src?: string;
  sourceCode?: string;
  skip?: boolean;
  isMarshalable?: boolean | "json" | ((obj: any) => boolean | "json");
  exposed?: ((api: API) => { [key: string]: any }) | { [key: string]: any };
  onError?: (err: any) => void;
  onPreInit?: () => void;
  onDispose?: () => void;
};

export type IFrameType = "main" | "modal" | "popup";

export type API = { main: IFrameAPI; modal: IFrameAPI; popup: IFrameAPI };

// restrict any classes
export const defaultIsMarshalable = (obj: any): boolean => {
  return (
    ((typeof obj !== "object" || obj === null) && typeof obj !== "function") ||
    Array.isArray(obj) ||
    Object.getPrototypeOf(obj) === Function.prototype ||
    Object.getPrototypeOf(obj) === Object.prototype
  );
};

const defaultOnError = (err: any) => {
  console.error("plugin error", err);
};

export default function useHook({
  src,
  sourceCode,
  skip,
  isMarshalable,
  exposed,
  onPreInit,
  onError = defaultOnError,
  onDispose,
}: Options = {}) {
  const arena = useRef<Arena | undefined>();
  const eventLoop = useRef<number>();
  const [loaded, setLoaded] = useState(false);
  const [code, setCode] = useState("");

  const mainIFrameRef = useRef<IFrameRef>(null);
  const modalIFrameRef = useRef<IFrameRef>(null);
  const popupIFrameRef = useRef<IFrameRef>(null);

  const evalCode = useCallback(
    (code: string): any => {
      if (!arena.current) return;

      let result: any;
      try {
        result = arena.current.evalCode(code);
      } catch (err) {
        onError(err);
      }

      const eventLoopCb = () => {
        if (!arena.current) return;
        try {
          arena.current.executePendingJobs();
          if (arena.current.context.runtime.hasPendingJob()) {
            eventLoop.current = window.setTimeout(eventLoopCb, 0);
          }
        } catch (err) {
          onError(err);
        }
      };
      eventLoop.current = window.setTimeout(eventLoopCb, 0);

      return result;
    },
    [onError],
  );

  useEffect(() => {
    (async () => {
      const code = sourceCode ?? (src ? await (await fetch(src)).text() : "");
      setCode(code);
    })();
  }, [sourceCode, src]);

  // init and dispose of vm
  useEffect(() => {
    if (skip || !code) return;
    const { api: mainIFrameApi } = mainIFrameRef.current ?? {};
    const { api: modalIFrameApi } = modalIFrameRef.current ?? {};
    const { api: popupIFrameApi } = popupIFrameRef.current ?? {};
    if (!mainIFrameApi || !modalIFrameApi || !popupIFrameApi) return;

    onPreInit?.();

    (async () => {
      const ctx = (await getQuickJS()).newContext();
      arena.current = new Arena(ctx, {
        isMarshalable: target =>
          defaultIsMarshalable(target) ||
          (typeof isMarshalable === "function" ? isMarshalable(target) : "json"),
      });

      const e =
        typeof exposed === "function"
          ? exposed({
              main: mainIFrameApi,
              modal: modalIFrameApi,
              popup: popupIFrameApi,
            })
          : exposed;
      if (e) {
        arena.current.expose(e);
      }

      evalCode(code);
      setLoaded(true);
    })();

    return () => {
      onDispose?.();
      mainIFrameRef.current?.reset();
      setLoaded(false);
      if (typeof eventLoop.current === "number") {
        window.clearTimeout(eventLoop.current);
      }
      if (arena.current) {
        try {
          arena.current.dispose();
          arena.current.context.dispose();
        } catch (err) {
          console.debug("quickjs-emscripten dispose error", err);
        } finally {
          arena.current = undefined;
        }
      }
    };
  }, [code, evalCode, isMarshalable, onDispose, onPreInit, skip, exposed]);

  return {
    mainIFrameRef,
    modalIFrameRef,
    popupIFrameRef,
    loaded,
  };
}
