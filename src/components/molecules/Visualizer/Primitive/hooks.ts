import { useEngineAPI } from "../engineApi";

export default function useHooks({ plugin }: { plugin?: string }) {
  const api = useEngineAPI();
  const Builtin = plugin ? api?.builtinPrimitives?.[plugin] : undefined;

  return {
    Builtin,
  };
}
