import { getQuickJS } from "quickjs-emscripten";
import { Arena } from "quickjs-emscripten-sync";
import { useCallback, useEffect, useRef, useState, useMemo, useImperativeHandle, Ref } from "react";

import type { Ref as IFrameRef } from "../IFrame";

import { usePostMessage } from "./usePostMessage";

export type IFrameAPI = {
  render: (
    html: string,
    options?: { visible?: boolean; width?: number | string; height?: number | string },
  ) => void;
  resize: (width: string | number | undefined, height: string | number | undefined) => void;
  postMessage: (message: any) => void;
};

export type ModalIFrameAPI = IFrameAPI & {
  close: () => void;
};

export type RefType = {
  resize: (width: string | number | undefined, height: string | number | undefined) => void;
  arena: () => Arena | undefined;
};

export type Options = {
  src?: string;
  sourceCode?: string;
  skip?: boolean;
  iframeCanBeVisible?: boolean;
  isMarshalable?: boolean | "json" | ((obj: any) => boolean | "json");
  ref?: Ref<RefType>;
  isModal?: boolean;
  onError?: (err: any) => void;
  onPreInit?: () => void;
  onDispose?: () => void;
  exposed?:
    | ((api: IFrameAPI, modalApi: IFrameAPI) => { [key: string]: any })
    | { [key: string]: any };
  onModalChange?: (html?: string | undefined) => void;
};

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
  iframeCanBeVisible,
  isMarshalable,
  ref,
  isModal,
  onPreInit,
  onError = defaultOnError,
  onDispose,
  exposed,
  onModalChange,
}: Options = {}) {
  const arena = useRef<Arena | undefined>();
  const eventLoop = useRef<number>();
  const [loaded, setLoaded] = useState(false);
  const [iFrameLoaded, setIFrameLoaded] = useState(false);
  const [code, setCode] = useState("");
  const iFrameRef = useRef<IFrameRef>(null);
  const [[iFrameHtml, iFrameOptions], setIFrameState] = useState<
    [string, { visible?: boolean; width?: number | string; height?: number | string } | undefined]
  >(["", undefined]);
  const postMessage = usePostMessage(iFrameRef, !loaded || !iFrameLoaded);

  const handleIFrameLoad = useCallback(() => setIFrameLoaded(true), []);

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

  const iFrameApi = useMemo<IFrameAPI>(
    () => ({
      render: (html, { visible = true, ...options } = {}) => {
        setIFrameState([html, { visible: !!iframeCanBeVisible && !!visible, ...options }]);
      },
      resize: (width, height) => {
        iFrameRef.current?.resize(width, height);
      },
      postMessage,
    }),
    [iframeCanBeVisible, postMessage],
  );

  const ModalIFrameApi = useMemo<ModalIFrameAPI>(
    () => ({
      render: (html, { visible = true, ...options } = {}) => {
        if (isModal) {
          setIFrameState([html, { visible: !!iframeCanBeVisible && !!visible, ...options }]);
        } else {
          onModalChange?.(html);
        }
      },
      resize: (width, height) => {
        console.log(width, height, "sladkfj");
        // iFrameRef.current?.resize(width, height);
      },
      postMessage,
      close: () => {
        onModalChange?.(undefined);
      },
    }),
    [iframeCanBeVisible, postMessage],
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

    onPreInit?.();

    (async () => {
      const ctx = (await getQuickJS()).newContext();
      arena.current = new Arena(ctx, {
        isMarshalable: target =>
          defaultIsMarshalable(target) ||
          (typeof isMarshalable === "function" ? isMarshalable(target) : "json"),
      });

      const e = typeof exposed === "function" ? exposed(iFrameApi, ModalIFrameApi) : exposed;
      if (e) {
        arena.current.expose(e);
      }

      evalCode(code);
      setLoaded(true);
    })();

    return () => {
      onDispose?.();
      setIFrameState(["", undefined]);
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
  }, [code, evalCode, iFrameApi, isMarshalable, onDispose, onPreInit, skip, exposed]);

  useEffect(() => {
    if (!loaded) setIFrameLoaded(false);
  }, [loaded]);

  useImperativeHandle(
    ref,
    (): RefType => ({
      resize: (width, height) => {
        iFrameRef.current?.resize(width, height);
      },
      arena: () => arena.current,
    }),
    [],
  );

  return {
    iFrameHtml,
    iFrameRef,
    iFrameOptions,
    loaded,
    handleIFrameLoad,
  };
}
