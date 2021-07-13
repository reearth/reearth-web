import { interval, intervalDuring, tweenInterval } from "./raf";

beforeEach(() => {
  window.requestAnimationFrame = jest.fn(window.requestAnimationFrame);
  window.cancelAnimationFrame = jest.fn(window.cancelAnimationFrame);
});

afterEach(() => {
  jest.useRealTimers();
});

describe("interval", () => {
  test("regular", done => {
    let count = 0;
    const cb = jest.fn<boolean, [number]>(() => ++count <= 3);
    interval(cb);

    expect(cb).toBeCalledTimes(0);
    expect(window.requestAnimationFrame).toBeCalledTimes(1);
    expect(window.cancelAnimationFrame).toBeCalledTimes(0);

    setTimeout(() => {
      expect(cb).toBeCalledTimes(4);
      expect(cb.mock.calls[0][0]).toBe(0);
      for (let i = 1; i < cb.mock.calls.length; i++) {
        expect(cb.mock.calls[i][0]).toBeGreaterThan(cb.mock.calls[i - 1][0]);
      }
      expect(window.requestAnimationFrame).toBeCalledTimes(4);
      expect(window.cancelAnimationFrame).toBeCalledTimes(0);
      done();
    }, 100);
  });

  test("cancel", done => {
    const cb = jest.fn();
    const cancel = interval(cb);

    expect(cb).toBeCalledTimes(0);
    expect(window.requestAnimationFrame).toBeCalledTimes(1);
    expect(window.cancelAnimationFrame).toBeCalledTimes(0);

    cancel();

    expect(window.cancelAnimationFrame).toBeCalledTimes(1);
    const requestId = (window.requestAnimationFrame as jest.Mock<number, [FrameRequestCallback]>)
      .mock.results[0].value;
    expect(window.cancelAnimationFrame).toBeCalledWith(requestId);

    setTimeout(() => {
      expect(cb).toBeCalledTimes(0);
      done();
    }, 50);
  });

  test("delay", () => {
    jest.useFakeTimers();

    const cb = jest.fn();
    interval(cb, 500);

    expect(cb).toBeCalledTimes(0);
    expect(window.setTimeout).toBeCalledTimes(1);
    expect(window.requestAnimationFrame).toBeCalledTimes(0);
    expect(window.cancelAnimationFrame).toBeCalledTimes(0);

    jest.advanceTimersByTime(400);
    expect(cb).toBeCalledTimes(0);

    jest.advanceTimersByTime(200);
    expect(cb).toBeCalledTimes(1);
    expect(window.requestAnimationFrame).toBeCalledTimes(0);
  });
});

describe("intervalDuring", () => {
  test("regular", done => {
    const cb = jest.fn<void, [number]>();
    intervalDuring(cb, 100);

    expect(cb).toBeCalledTimes(0);
    expect(window.requestAnimationFrame).toBeCalledTimes(1);
    expect(window.cancelAnimationFrame).toBeCalledTimes(0);

    setTimeout(() => {
      const times = cb.mock.calls.length;
      expect(window.requestAnimationFrame).toBeCalledTimes(times);
      expect(window.cancelAnimationFrame).toBeCalledTimes(0);

      expect(cb.mock.calls[0][0]).toBe(0);
      expect(cb.mock.calls[cb.mock.calls.length - 1][0]).toBe(1);
      for (let i = 1; i < cb.mock.calls.length; i++) {
        expect(cb.mock.calls[i][0]).toBeGreaterThan(cb.mock.calls[i - 1][0]);
      }

      setTimeout(() => {
        // cb will not be called after intervalDuring ends
        expect(cb).toBeCalledTimes(times);
        done();
      }, 100);
    }, 200);
  });
});

describe("tweenInterval", () => {
  test("regular", done => {
    const cb = jest.fn<void, [number, number]>();
    tweenInterval(cb, "cubic", 100);

    expect(cb).toBeCalledTimes(0);
    expect(window.requestAnimationFrame).toBeCalledTimes(1);
    expect(window.cancelAnimationFrame).toBeCalledTimes(0);

    setTimeout(() => {
      const times = cb.mock.calls.length;
      expect(window.requestAnimationFrame).toBeCalledTimes(times);
      expect(window.cancelAnimationFrame).toBeCalledTimes(0);

      expect(cb.mock.calls[0][0]).toBe(0);
      expect(cb.mock.calls[0][1]).toBe(0);
      expect(cb.mock.calls[cb.mock.calls.length - 1][0]).toBe(1);
      expect(cb.mock.calls[cb.mock.calls.length - 1][1]).toBe(1);
      for (let i = 1; i < cb.mock.calls.length; i++) {
        expect(cb.mock.calls[i][1]).toBeGreaterThan(cb.mock.calls[i - 1][1]);
      }

      setTimeout(() => {
        // cb will not be called after intervalDuring ends
        expect(cb).toBeCalledTimes(times);
        done();
      }, 100);
    }, 200);
  });
});
