import { useCallback, useEffect, useRef, useState } from "react";
import { getQuickJS } from "quickjs-emscripten";
import Arena from "quickjs-emscripten-sync";

export default function usePlugin<T>({ expose, skip }: { expose?: T; skip?: boolean } = {}) {
  const [loaded, setLoaded] = useState(false);
  const arena = useRef<Arena | undefined>();
  const exposed = useRef<T | undefined>();
  const disposed = useRef(false);

  const evalCode = useCallback((code: string) => {
    if (!arena.current) return;
    return arena.current.evalCode(code);
  }, []);

  useEffect(() => {
    if (skip) return;

    (async () => {
      const vm = (await getQuickJS()).createVm();
      if (!disposed.current) {
        arena.current = new Arena(vm);
        if (expose) {
          exposed.current = arena.current.expose(expose, true);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip]); // ignore expose

  return {
    evalCode: loaded ? evalCode : undefined,
    exposed: exposed.current,
  };
}
