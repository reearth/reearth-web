export function delayedObject<T>(obj: T, excludedKeys?: string[]): Readonly<T> {
  const res: any = {};
  const descs = Object.keys(obj).reduce<PropertyDescriptorMap>(
    (a, b) => ({
      ...a,
      [b]: excludedKeys?.includes(b)
        ? {
            value: (obj as any)[b],
            configurable: false,
            enumerable: true,
            writable: false,
          }
        : {
            get() {
              return (obj as any)[b];
            },
            configurable: false,
            enumerable: true,
          },
    }),
    {},
  );
  Object.defineProperties(res, descs);
  return res;
}

export function objectFromGetter<T extends { [K in keyof T]: any }>(
  keys: (keyof T)[],
  fn: (this: T, key: keyof T) => T[keyof T],
): Readonly<T> {
  const res: any = {};
  const descs = keys.reduce<PropertyDescriptorMap>(
    (a, b) => ({
      ...a,
      [b]: {
        get() {
          return fn.call(this, b);
        },
        configurable: false,
        enumerable: true,
      },
    }),
    {},
  );
  Object.defineProperties(res, descs);
  return res;
}
