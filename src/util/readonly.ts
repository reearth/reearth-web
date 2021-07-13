/* eslint-disable @typescript-eslint/ban-types */

export default function readonly<T>(target: T): T extends object ? DeepReadonly<T> : undefined {
  if (typeof target !== "object" || Object.getPrototypeOf(target) !== Object.prototype)
    return undefined as any;
  const result: any = {};
  for (const [key, value] of Object.entries(target)) {
    const ro = readonly(value);
    Object.defineProperty(result, key, {
      get() {
        return ro ?? value;
      },
    });
  }
  return result;
}

type DeepReadonly<T> = {
  readonly [P in keyof T]: T extends object ? DeepReadonly<T> : T;
};
