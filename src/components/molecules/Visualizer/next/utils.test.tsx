import { renderHook, act } from "@testing-library/react";
import { useAtomValue, useSetAtom } from "jotai";
import { useMemo } from "react";
import { test, expect } from "vitest";

import { cacheAtom } from "./utils";

test("cacheAtom", () => {
  const { result } = renderHook(() => {
    const [getCache, setCache] = useMemo(() => cacheAtom<string>(), []);
    const map = useAtomValue(getCache);
    const set = useSetAtom(setCache);
    return [map, set] as const;
  });

  expect(result.current[0]?.get("test")).toBeUndefined();

  act(() => {
    result.current[1]({ key: "test", value: "aaaa" });
  });

  expect(result.current[0]?.get("test")).toBe("aaaa");

  act(() => {
    result.current[1]({ key: "test" });
  });

  expect(result.current[0]?.has("test")).toBe(false);
});
