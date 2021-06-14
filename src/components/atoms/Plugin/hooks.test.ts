/*
import { renderHook } from "@testing-library/react-hooks";
import { enableFetchMocks } from "jest-fetch-mock";
import useHook from "./hooks";

test.skip("works", async () => {
  const expose = () => ({
    hoge: {
      foo: jest.fn((msg: string) => msg + "bar"),
      num: 0,
    },
  });
  const { result, waitForNextUpdate, unmount } = renderHook(() =>
    useHook({
      expose,
    }),
  );

  expect(result.current.evalCode).toBe(undefined);

  await waitForNextUpdate();

  expect(result.current.evalCode).toBeInstanceOf(Function);
  expect(result.current.evalCode?.("1 + 1")).toBe(2);

  unmount(); // test wheter vm can be disposed without errors
});

test.skip("skip", async () => {
  const { result, rerender, waitForNextUpdate, unmount } = renderHook(
    ({ skip }: { skip: boolean } = { skip: true }) =>
      useHook({
        skip,
      }),
  );

  expect(result.current.evalCode).toBe(undefined);

  rerender({ skip: false });

  expect(result.current.evalCode).toBe(undefined);

  await waitForNextUpdate();

  expect(result.current.evalCode).toBeInstanceOf(Function);

  unmount(); // test wheter vm can be disposed without errors
});

test.skip("src", async () => {
  enableFetchMocks();
  fetchMock.doMockIf("/plugin.js", "module.exports = 1010;");

  const { result, waitForNextUpdate, unmount } = renderHook(() =>
    useHook({
      src: "/plugin.js",
      expose: () => ({
        module: {
          exports: undefined,
        },
      }),
    }),
  );

  await waitForNextUpdate();

  expect(result.current.evalCode?.("module.exports")).toBe(1010);

  unmount();
});
*/
