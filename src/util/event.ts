export type EventCallback<T extends any[] = any[]> = (...args: T) => void;
export type EventEmitter<E extends { [P in string]: any[] } = { [P in string]: any[] }> = <
  T extends keyof E,
>(
  type: T,
  ...args: E[T]
) => void;

export type Events<E extends { [P in string]: any[] } = { [P in string]: any[] }> = {
  readonly on: <T extends keyof E>(type: T, callback: EventCallback<E[T]>) => void;
  readonly off: <T extends keyof E>(type: T, callback: EventCallback<E[T]>) => void;
  readonly once: <T extends keyof E>(type: T, callback: EventCallback<E[T]>) => void;
};

export default function events<E extends { [P in string]: any[] } = { [P in string]: any[] }>(): [
  Events<E>,
  EventEmitter<E>,
  <T extends keyof E>(
    name: T,
  ) => [() => EventCallback<E[T]> | undefined, (callback?: EventCallback<E[T]>) => void],
] {
  const e = new EventTarget();
  const callbacks = new Map<keyof E, Map<EventCallback<E[keyof E]>, (e: Event) => void>>();
  const getEventCallback = <T extends keyof E>(
    type: T,
    cb: EventCallback<E[T]>,
  ): ((e: Event) => void) => {
    let ecbs = callbacks.get(type);
    if (!ecbs) {
      ecbs = new Map();
      callbacks.set(type, ecbs);
    }

    let ecb = ecbs.get(cb as EventCallback);
    if (!ecb) {
      ecb = (e: Event): void => {
        cb(...(e as CustomEvent).detail);
      };
      ecbs.set(cb as EventCallback, ecb);
    }

    return ecb;
  };
  const deleteEventCallback = (type: keyof E, cb: EventCallback): void => {
    callbacks.get(type)?.delete(cb);
  };

  const on = <T extends keyof E>(type: T, callback: EventCallback<E[T]>) => {
    const ecb = getEventCallback(type, callback);
    e.addEventListener(String(type), ecb);
  };
  const off = <T extends keyof E>(type: T, callback: EventCallback<E[T]>) => {
    const ecb = getEventCallback(type, callback);
    e.removeEventListener(String(type), ecb);
    deleteEventCallback(type, ecb);
  };
  const once = <T extends keyof E>(type: T, callback: EventCallback<E[T]>) => {
    const ecb = getEventCallback(type, callback);
    e.addEventListener(String(type), ecb, { once: true });
  };

  const events = {
    get on() {
      return on;
    },
    get off() {
      return off;
    },
    get once() {
      return once;
    },
  };

  return [
    events,
    <T extends keyof E>(type: T, ...args: E[T]) =>
      e.dispatchEvent(new CustomEvent(String(type), { detail: args })),
    <T extends keyof E>(name: T) => eventFn(name, events),
  ];
}

function eventFn<T extends keyof E, E extends { [P in string]: any[] } = { [P in string]: any[] }>(
  name: T,
  e: Events<E>,
): [() => EventCallback<E[T]> | undefined, (callback?: EventCallback<E[T]>) => void] {
  let cb: EventCallback<E[T]> | undefined;
  return [
    () => cb,
    (value?: EventCallback<E[T]>) => {
      if (typeof cb === "function") {
        e.off(name, cb);
        cb = undefined;
      }
      if (value) {
        cb = value;
        e.on(name, value);
      }
    },
  ];
}
