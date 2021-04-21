import { useCallback, useEffect, useRef, useState } from "react";
import { getQuickJS } from "quickjs-emscripten";
import Arena from "quickjs-emscripten-sync";

export type Options<T> = { src?: string; expose?: T; skip?: boolean };

export default function usePlugin<T>(options: Options<T> = {}) {
  const [loaded, setLoaded] = useState(false);
  const arena = useRef<Arena | undefined>();
  const exposed = useRef<T | undefined>();
  const disposed = useRef(false);
  const optionsRef = useRef<Options<T>>(options);

  if (!loaded) {
    optionsRef.current = options;
  }

  const evalCode = useCallback((code: string) => {
    if (!arena.current) return;
    return arena.current.evalCode(code);
  }, []);

  // init and dispose of vm
  useEffect(() => {
    if (options.skip) return;

    (async () => {
      const vm = (await getQuickJS()).createVm();
      if (!disposed.current) {
        arena.current = new Arena(vm);
        if (optionsRef.current.expose) {
          exposed.current = arena.current.expose(optionsRef.current.expose, true);
        }

        // load JS
        if (optionsRef.current.src) {
          const code = await (await fetch(optionsRef.current.src)).text();
          arena.current.evalCode(code);
        }

        setLoaded(true);
      }
    })();

    return () => {
      if (arena.current) {
        try {
          exposed.current = undefined;
          arena.current.dispose();
          arena.current.vm.dispose();
        } catch (err) {
          console.error(err);
        }
        arena.current = undefined;
      }
      disposed.current = true;
    };
  }, [options.skip]);

  return {
    evalCode: loaded ? evalCode : undefined,
    exposed: exposed.current,
  };
}
