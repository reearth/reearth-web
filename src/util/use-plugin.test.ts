import { renderHook } from "@testing-library/react-hooks";
import { enableFetchMocks } from "jest-fetch-mock";
import usePlugin from "./use-plugin";
test("works", async () => {
  const expose = {
    hoge: {
      foo: jest.fn((msg: string) => msg + "bar"),
      num: 0,
    },
  };
  const { result, waitForNextUpdate, unmount } = renderHook(() =>
    usePlugin({
      expose,
    }),
  );

  expect(result.current.evalCode).toBe(undefined);
  expect(result.current.exposed).toBe(undefined);

  await waitForNextUpdate();

  expect(result.current.evalCode).toBeInstanceOf(Function);
  expect(result.current.exposed).toEqual(expose);

  expect(result.current.evalCode?.("1 + 1")).toBe(2);

  expect(expose.hoge.foo).toBeCalledTimes(0);
  expect(result.current.evalCode?.(`hoge.num`)).toBe(0);
  expect(result.current.evalCode?.(`hoge.foo("foo")`)).toBe("foobar");
  expect(expose.hoge.foo).toBeCalledTimes(1);
  expect(expose.hoge.foo).toBeCalledWith("foo");

  if (!result.current.exposed) throw new Error("result.current.exposed is undefined");
  result.current.exposed.hoge.num = 1;
  expect(result.current.evalCode?.(`hoge.num`)).toBe(1);

  unmount(); // test wheter vm can be disposed without errors
});

test("skip", async () => {
  const { result, rerender, waitForNextUpdate, unmount } = renderHook(
    ({ skip }: { skip: boolean } = { skip: true }) =>
      usePlugin({
        skip,
      }),
  );

  expect(result.current.evalCode).toBe(undefined);
  expect(result.current.exposed).toBe(undefined);

  rerender({ skip: false });

  expect(result.current.evalCode).toBe(undefined);
  expect(result.current.exposed).toBe(undefined);

  await waitForNextUpdate();

  expect(result.current.evalCode).toBeInstanceOf(Function);
  expect(result.current.exposed).toEqual(undefined);

  unmount(); // test wheter vm can be disposed without errors
});

test("src", async () => {
  enableFetchMocks();
  fetchMock.doMockIf("/plugin.js", "module.exports = 1010;");

  const { result, waitForNextUpdate, unmount } = renderHook(() =>
    usePlugin({
      src: "/plugin.js",
      expose: {
        module: {
          exports: undefined,
        },
      },
    }),
  );

  await waitForNextUpdate();

  expect(result.current.evalCode?.("module.exports")).toBe(1010);

  unmount();
});
