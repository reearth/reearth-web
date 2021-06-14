import { useCallback, useEffect, useRef, useState } from "react";
import { getQuickJS } from "quickjs-emscripten";
import Arena from "quickjs-emscripten-sync";

import type { Ref as IFrameRef } from "./PluginIFrame";

export type Options<T> = {
  src?: string;
  skip?: boolean;
  iframeCanBeVisible?: boolean;
  onMessageCode?: string;
  onError?: (err: any) => void;
  onExpose?: (api: {
    render: (html: string, visible?: boolean) => void;
    postMessage: (message: any) => void;
  }) => T;
};

const defaultOnError = (err: any) => {
  console.error("plugin error", err?.message || err);
};

export default function useHook<T>({
  src,
  skip,
  onMessageCode,
  iframeCanBeVisible,
  onError = defaultOnError,
  onExpose,
}: Options<T> = {}) {
  const arena = useRef<Arena | undefined>();
  const eventLoop = useRef<number>();
  const [loaded, setLoaded] = useState(false);
  const iFrameRef = useRef<IFrameRef>(null);
  const [[iFrameHtml, iFrameVisible], setIFrameState] = useState<[string, boolean]>(["", false]);

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
          if (arena.current.vm.hasPendingJob()) {
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

  const onMessage = useCallback(
    (message: any) => {
      if (!arena.current || !onMessageCode) return;
      try {
        const cb = evalCode(onMessageCode);
        if (typeof cb === "function") {
          cb(message);
        }
      } catch (err) {
        console.error("plugin error", err);
      }
    },
    [evalCode, onMessageCode],
  );

  // init and dispose of vm
  useEffect(() => {
    if (skip) return;

    (async () => {
      const vm = (await getQuickJS()).createVm();
      arena.current = new Arena(vm);
      setLoaded(true);
    })();

    return () => {
      if (typeof eventLoop.current === "number") {
        window.clearTimeout(eventLoop.current);
      }
      if (arena.current) {
        try {
          arena.current.dispose();
          arena.current.vm.dispose();
        } catch (err) {
          console.error(err);
        } finally {
          arena.current = undefined;
          setLoaded(false);
        }
      }
    };
  }, [onError, skip, src]);

  useEffect(() => {
    if (!arena.current || !onExpose || !loaded) return;
    const exposed = onExpose({
      render: (html, visible) => {
        setIFrameState([html, !!iframeCanBeVisible && !!visible]);
      },
      postMessage: msg => {
        iFrameRef.current?.postMessage(msg);
      },
    });
    arena.current.expose(exposed);
  }, [onExpose, loaded, iframeCanBeVisible]);

  useEffect(() => {
    if (!arena.current || !src || !loaded) return;

    setIFrameState(s => (!s[0] && !s[1] ? s : ["", false]));
    // load JS
    (async () => {
      if (!arena.current) return;
      const code = await (await fetch(src)).text();
      try {
        evalCode(code);
      } catch (err) {
        onError(err);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, loaded]); // ignore onError and evalCode

  return {
    iFrameRef,
    iFrameHtml,
    iFrameVisible,
    loaded,
    onMessage,
  };
}
