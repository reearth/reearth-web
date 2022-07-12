import { renderHook } from "@testing-library/react";

import { usePostMessage } from "./usePostMessage";

test("usePostMessage", () => {
  type P = Parameters<typeof usePostMessage>[0];
  const nullIFrame: P = { current: null };
  const iFrame: P = {
    current: {
      postMessage: jest.fn(),
      resize: () => {},
    },
  };

  const { result, rerender } = renderHook(({ iFrame }) => usePostMessage(iFrame), {
    initialProps: { iFrame: nullIFrame },
  });

  result.current({ hoge: true });
  expect(iFrame.current?.postMessage).toBeCalledTimes(0);

  rerender({ iFrame });
  expect(iFrame.current?.postMessage).toBeCalledTimes(1);
  expect(iFrame.current?.postMessage).toBeCalledWith({ hoge: true });

  result.current({ foo: true });
  expect(iFrame.current?.postMessage).toBeCalledTimes(2);
  expect(iFrame.current?.postMessage).toBeCalledWith({ foo: true });
});
