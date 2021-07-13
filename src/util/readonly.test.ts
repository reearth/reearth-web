import readonly from "./readonly";

test("works", () => {
  const ro = readonly({ a: 1, b: 2, c: { d: 3 } }) as any;
  expect(() => {
    ro.a = 2;
  }).toThrow();
  expect(() => {
    ro.b = 2;
  }).toThrow();
  expect(() => {
    ro.c.d = 2;
  }).toThrow();
  expect(ro.a).toBe(1);
  expect(ro.b).toBe(2);
  expect(ro.c.d).toBe(3);
});

test("restricted", () => {
  class Cls {}
  expect(readonly(true)).toBeUndefined();
  expect(readonly(1)).toBeUndefined();
  expect(readonly("a")).toBeUndefined();
  expect(readonly(() => {})).toBeUndefined();
  expect(readonly(new Cls())).toBeUndefined();
});
